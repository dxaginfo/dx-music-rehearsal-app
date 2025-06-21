const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { requireBandManager } = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /api/rehearsals:
 *   get:
 *     summary: Get rehearsals with filters
 *     tags: [Rehearsals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: bandId
 *         schema:
 *           type: string
 *         description: Filter by band ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SCHEDULED, CANCELED, COMPLETED]
 *         description: Filter by status
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by start date (ISO format)
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by end date (ISO format)
 *     responses:
 *       200:
 *         description: List of rehearsals
 */
router.get('/', async (req, res, next) => {
  try {
    const { bandId, status, from, to } = req.query;
    
    // Build filter
    const filter = {};
    
    if (bandId) {
      filter.bandId = bandId;
    } else {
      // If no band specified, only show rehearsals for bands the user is a member of
      const userBands = await prisma.bandMember.findMany({
        where: { userId: req.user.id },
        select: { bandId: true },
      });
      
      if (userBands.length === 0) {
        return res.status(200).json({ rehearsals: [] });
      }
      
      filter.bandId = { in: userBands.map(band => band.bandId) };
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (from || to) {
      filter.startTime = {};
      
      if (from) {
        filter.startTime.gte = new Date(from);
      }
      
      if (to) {
        filter.startTime.lte = new Date(to);
      }
    }
    
    // Get rehearsals
    const rehearsals = await prisma.rehearsal.findMany({
      where: filter,
      include: {
        band: {
          select: {
            name: true,
          },
        },
        items: true,
        availability: {
          where: {
            userId: req.user.id,
          },
          select: {
            status: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });
    
    res.status(200).json({ rehearsals });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/rehearsals/{id}:
 *   get:
 *     summary: Get rehearsal by ID
 *     tags: [Rehearsals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Rehearsal ID
 *     responses:
 *       200:
 *         description: Rehearsal details
 *       404:
 *         description: Rehearsal not found
 */
router.get('/:id', [
  param('id').isUUID().withMessage('Invalid rehearsal ID'),
], async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    
    // Get rehearsal with related data
    const rehearsal = await prisma.rehearsal.findUnique({
      where: { id },
      include: {
        band: {
          select: {
            id: true,
            name: true,
          },
        },
        items: {
          orderBy: {
            orderIndex: 'asc',
          },
        },
        availability: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        attendance: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
    
    // Check if rehearsal exists
    if (!rehearsal) {
      return res.status(404).json({
        message: 'Rehearsal not found',
      });
    }
    
    // Check if user is a member of the band
    const isMember = await prisma.bandMember.findFirst({
      where: {
        bandId: rehearsal.bandId,
        userId: req.user.id,
      },
    });
    
    if (!isMember && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        message: 'You do not have permission to view this rehearsal',
      });
    }
    
    res.status(200).json({ rehearsal });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/rehearsals:
 *   post:
 *     summary: Create a new rehearsal
 *     tags: [Rehearsals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bandId
 *               - title
 *               - startTime
 *               - endTime
 *             properties:
 *               bandId:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     durationMinutes:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Rehearsal created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Not authorized
 */
router.post('/', [
  requireBandManager,
  body('bandId').isUUID().withMessage('Valid band ID is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('startTime').isISO8601().withMessage('Valid start time is required'),
  body('endTime').isISO8601().withMessage('Valid end time is required')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startTime)) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
  body('location').optional(),
  body('description').optional(),
  body('items').optional().isArray(),
  body('items.*.title').optional().notEmpty().withMessage('Item title is required'),
  body('items.*.description').optional(),
  body('items.*.durationMinutes').optional().isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
], async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { bandId, title, description, startTime, endTime, location, items } = req.body;
    
    // Check if user is a manager of the band
    const isBandManager = await prisma.bandMember.findFirst({
      where: {
        bandId,
        userId: req.user.id,
        role: 'BAND_MANAGER',
      },
    });
    
    if (!isBandManager && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        message: 'You do not have permission to create rehearsals for this band',
      });
    }
    
    // Create rehearsal with items
    const rehearsal = await prisma.rehearsal.create({
      data: {
        bandId,
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        location,
        status: 'SCHEDULED',
        createdBy: req.user.id,
        items: items ? {
          create: items.map((item, index) => ({
            title: item.title,
            description: item.description,
            durationMinutes: item.durationMinutes,
            orderIndex: index,
          })),
        } : undefined,
      },
      include: {
        items: true,
      },
    });
    
    // Get band members to notify
    const bandMembers = await prisma.bandMember.findMany({
      where: {
        bandId,
        status: 'ACTIVE',
      },
      select: {
        userId: true,
      },
    });
    
    // Create notifications for all band members
    await prisma.notification.createMany({
      data: bandMembers.map(member => ({
        userId: member.userId,
        rehearsalId: rehearsal.id,
        type: 'UPDATE',
        message: `New rehearsal scheduled: ${title}`,
      })),
    });
    
    res.status(201).json({
      message: 'Rehearsal created successfully',
      rehearsal,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/rehearsals/{id}:
 *   put:
 *     summary: Update a rehearsal
 *     tags: [Rehearsals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Rehearsal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [SCHEDULED, CANCELED, COMPLETED]
 *     responses:
 *       200:
 *         description: Rehearsal updated successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Rehearsal not found
 */
router.put('/:id', [
  requireBandManager,
  param('id').isUUID().withMessage('Invalid rehearsal ID'),
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('startTime').optional().isISO8601().withMessage('Valid start time is required'),
  body('endTime').optional().isISO8601().withMessage('Valid end time is required')
    .custom((value, { req }) => {
      if (req.body.startTime && new Date(value) <= new Date(req.body.startTime)) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
  body('location').optional(),
  body('description').optional(),
  body('status').optional().isIn(['SCHEDULED', 'CANCELED', 'COMPLETED']).withMessage('Invalid status'),
], async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const updateData = req.body;
    
    // Convert date strings to Date objects
    if (updateData.startTime) {
      updateData.startTime = new Date(updateData.startTime);
    }
    
    if (updateData.endTime) {
      updateData.endTime = new Date(updateData.endTime);
    }
    
    // Find the rehearsal
    const existingRehearsal = await prisma.rehearsal.findUnique({
      where: { id },
      include: {
        band: {
          select: {
            id: true,
          },
        },
      },
    });
    
    if (!existingRehearsal) {
      return res.status(404).json({
        message: 'Rehearsal not found',
      });
    }
    
    // Check if user is a manager of the band
    const isBandManager = await prisma.bandMember.findFirst({
      where: {
        bandId: existingRehearsal.bandId,
        userId: req.user.id,
        role: 'BAND_MANAGER',
      },
    });
    
    if (!isBandManager && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        message: 'You do not have permission to update this rehearsal',
      });
    }
    
    // Update rehearsal
    const updatedRehearsal = await prisma.rehearsal.update({
      where: { id },
      data: updateData,
    });
    
    // Create notification if status changed to CANCELED
    if (updateData.status === 'CANCELED') {
      // Get band members to notify
      const bandMembers = await prisma.bandMember.findMany({
        where: {
          bandId: existingRehearsal.bandId,
          status: 'ACTIVE',
        },
        select: {
          userId: true,
        },
      });
      
      // Create cancellation notifications
      await prisma.notification.createMany({
        data: bandMembers.map(member => ({
          userId: member.userId,
          rehearsalId: id,
          type: 'CANCELLATION',
          message: `Rehearsal canceled: ${existingRehearsal.title}`,
        })),
      });
    }
    
    res.status(200).json({
      message: 'Rehearsal updated successfully',
      rehearsal: updatedRehearsal,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/rehearsals/{id}/availability:
 *   post:
 *     summary: Update user availability for a rehearsal
 *     tags: [Rehearsals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Rehearsal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [AVAILABLE, UNAVAILABLE, MAYBE]
 *     responses:
 *       200:
 *         description: Availability updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Rehearsal not found
 */
router.post('/:id/availability', [
  param('id').isUUID().withMessage('Invalid rehearsal ID'),
  body('status').isIn(['AVAILABLE', 'UNAVAILABLE', 'MAYBE']).withMessage('Invalid availability status'),
], async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const { status } = req.body;
    
    // Check if rehearsal exists
    const rehearsal = await prisma.rehearsal.findUnique({
      where: { id },
    });
    
    if (!rehearsal) {
      return res.status(404).json({
        message: 'Rehearsal not found',
      });
    }
    
    // Check if user is a member of the band
    const isMember = await prisma.bandMember.findFirst({
      where: {
        bandId: rehearsal.bandId,
        userId: req.user.id,
      },
    });
    
    if (!isMember) {
      return res.status(403).json({
        message: 'You are not a member of this band',
      });
    }
    
    // Update or create availability
    const availability = await prisma.availability.upsert({
      where: {
        userId_rehearsalId: {
          userId: req.user.id,
          rehearsalId: id,
        },
      },
      update: {
        status,
        responseTime: new Date(),
      },
      create: {
        userId: req.user.id,
        rehearsalId: id,
        status,
      },
    });
    
    res.status(200).json({
      message: 'Availability updated successfully',
      availability,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;