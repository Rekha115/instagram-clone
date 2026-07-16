import express from 'express';
import { param } from 'express-validator';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllAsRead);
router.patch(
  '/:notificationId/read',
  [param('notificationId').isMongoId().withMessage('Invalid notification id')],
  validate,
  markAsRead
);

export default router;
