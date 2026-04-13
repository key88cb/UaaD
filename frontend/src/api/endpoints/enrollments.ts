import api from '../axios';
import type { CreateEnrollmentResult, EnrollmentStatus, EnrollmentStatusItem } from '../../types';

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface BackendEnrollmentActionData {
  enrollment_id?: number;
  activity_id?: number;
  status?: EnrollmentStatus;
  queue_position?: number;
  estimated_wait_seconds?: number;
  stock_remaining?: number;
  order_no?: string;
}

interface BackendEnrollmentStatusData {
  enrollment_id: number;
  activity_id: number;
  activity_title?: string;
  status: EnrollmentStatus;
  queue_position?: number;
  estimated_wait_seconds?: number;
  submitted_at?: string;
  finalized_at?: string;
  order_no?: string;
}

function normalizeEnrollmentAction(
  payload: ApiResponse<BackendEnrollmentActionData | null>,
): CreateEnrollmentResult {
  return {
    code: payload.code,
    message: payload.message,
    enrollmentId: payload.data?.enrollment_id,
    activityId: payload.data?.activity_id,
    status: payload.data?.status,
    queuePosition: payload.data?.queue_position,
    estimatedWaitSeconds: payload.data?.estimated_wait_seconds,
    stockRemaining: payload.data?.stock_remaining,
    orderNo: payload.data?.order_no,
  };
}

export async function createEnrollment(activityId: number): Promise<CreateEnrollmentResult> {
  const response = await api.post<ApiResponse<BackendEnrollmentActionData | null>>('/enrollments', {
    activity_id: activityId,
  });

  return normalizeEnrollmentAction(response.data);
}

export async function getEnrollmentStatus(enrollmentId: number): Promise<EnrollmentStatusItem> {
  const response = await api.get<ApiResponse<BackendEnrollmentStatusData>>(
    `/enrollments/${enrollmentId}/status`,
  );
  const data = response.data.data;

  return {
    enrollmentId: data.enrollment_id,
    activityId: data.activity_id,
    activityTitle: data.activity_title,
    status: data.status,
    queuePosition: data.queue_position,
    estimatedWaitSeconds: data.estimated_wait_seconds,
    submittedAt: data.submitted_at,
    finalizedAt: data.finalized_at,
    orderNo: data.order_no,
  };
}
