import { activityHandlers } from './activities';
import { notificationHandlers } from './notifications';
import { recommendationHandlers } from './recommendations';

export const handlers = [
  ...activityHandlers,
  ...recommendationHandlers,
  ...notificationHandlers,
];
