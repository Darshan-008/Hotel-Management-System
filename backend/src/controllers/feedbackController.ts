import { Request, Response } from 'express';
import prisma from '../db';
import { feedbackSchema } from '../validation';
import { AuthRequest } from '../middleware/authMiddleware';

export const getAllFeedback = async (req: Request, res: Response) => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({ error: 'Failed to fetch feedbacks list' });
  }
};

export const createFeedback = async (req: Request, res: Response) => {
  try {
    // 1. Zod validation
    const validatedData = feedbackSchema.parse(req.body);

    // 2. Resolve user
    const userId = (req as AuthRequest).user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 3. Save feedback
    const feedback = await prisma.feedback.create({
      data: {
        rating: validatedData.rating,
        comment: validatedData.comment,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.status(201).json(feedback);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Error creating feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
};
