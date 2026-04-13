export type EnrollmentStatus = 'QUEUING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

export interface CreateEnrollmentResult {
  code: number;
  message: string;
  enrollmentId?: number;
  activityId?: number;
  status?: EnrollmentStatus;
  queuePosition?: number;
  estimatedWaitSeconds?: number;
  stockRemaining?: number;
  orderNo?: string;
}

export interface EnrollmentStatusItem {
  enrollmentId: number;
  activityId: number;
  activityTitle?: string;
  status: EnrollmentStatus;
  queuePosition?: number;
  estimatedWaitSeconds?: number;
  submittedAt?: string;
  finalizedAt?: string;
  orderNo?: string;
}
