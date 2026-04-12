import api from '../axios';
import type {
  CreateEnrollmentResult,
  EnrollmentListItem,
  EnrollmentListResult,
  EnrollmentStatus,
  EnrollmentStatusDetail,
} from '../../types';

interface BackendPayload<T> {
  code: number;
  message: string;
  data: T;
}

interface BackendPaginatedPayload<T> {
  code: number;
  message: string;
  data: {
    list: T[];
    total: number;
    page: number;
    page_size: number;
  };
}

interface BackendCreateEnrollmentData {
  status: EnrollmentStatus;
  queue_position: number;
  enrollment_id?: number;
  order_no?: string;
}

interface BackendEnrollmentStatusData {
  enrollment_id: number;
  activity_id: number;
  status: EnrollmentStatus;
  submitted_at: string;
  activity_title?: string;
  order_no?: string;
  finalized_at?: string;
}

interface BackendEnrollmentListItem {
  id: number;
  user_id: number;
  activity_id: number;
  status: EnrollmentStatus;
  queue_position?: number | null;
  enrolled_at: string;
  finalized_at?: string | null;
}

function normalizeEnrollmentListItem(item: BackendEnrollmentListItem): EnrollmentListItem {
  return {
    id: item.id,
    userId: item.user_id,
    activityId: item.activity_id,
    status: item.status,
    queuePosition: item.queue_position,
    enrolledAt: item.enrolled_at,
    finalizedAt: item.finalized_at,
  };
}

export async function createEnrollment(activityId: number): Promise<CreateEnrollmentResult> {
  const response = await api.post<BackendPayload<BackendCreateEnrollmentData>>('/enrollments', {
    activity_id: activityId,
  });

  return {
    status: response.data.data.status,
    queuePosition: response.data.data.queue_position,
    enrollmentId: response.data.data.enrollment_id,
    orderNo: response.data.data.order_no,
  };
}

export async function getEnrollmentStatus(enrollmentId: number): Promise<EnrollmentStatusDetail> {
  const response = await api.get<BackendPayload<BackendEnrollmentStatusData>>(
    `/enrollments/${enrollmentId}/status`,
  );

  return {
    enrollmentId: response.data.data.enrollment_id,
    activityId: response.data.data.activity_id,
    status: response.data.data.status,
    submittedAt: response.data.data.submitted_at,
    activityTitle: response.data.data.activity_title,
    orderNo: response.data.data.order_no,
    finalizedAt: response.data.data.finalized_at,
  };
}

export async function listMyEnrollments(page = 1, pageSize = 20): Promise<EnrollmentListResult> {
  const response = await api.get<BackendPaginatedPayload<BackendEnrollmentListItem>>('/enrollments', {
    params: {
      page,
      page_size: pageSize,
    },
  });

  return {
    list: response.data.data.list.map(normalizeEnrollmentListItem),
    total: response.data.data.total,
    page: response.data.data.page,
    pageSize: response.data.data.page_size,
  };
}
