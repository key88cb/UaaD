export type EnrollmentStatus = 'QUEUING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

export interface CreateEnrollmentResult {
  status: EnrollmentStatus;
  queuePosition: number;
  enrollmentId?: number;
  orderNo?: string;
}

export interface EnrollmentStatusDetail {
  enrollmentId: number;
  activityId: number;
  status: EnrollmentStatus;
  submittedAt: string;
  activityTitle?: string;
  orderNo?: string;
  finalizedAt?: string;
}

export interface EnrollmentListItem {
  id: number;
  userId: number;
  activityId: number;
  status: EnrollmentStatus;
  queuePosition?: number | null;
  enrolledAt: string;
  finalizedAt?: string | null;
}

export interface EnrollmentListResult {
  list: EnrollmentListItem[];
  total: number;
  page: number;
  pageSize: number;
}
