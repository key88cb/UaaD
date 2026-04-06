import api from '../axios';
import type {
  RecommendationResponse,
  RecommendationSectionItem,
} from '../../types';

interface BackendRecommendationItem {
  id?: number;
  activity_id?: number;
  title: string;
  description?: string;
  cover_url?: string | null;
  location: string;
  category: RecommendationSectionItem['category'];
  tags?: string[] | string | null;
  max_capacity?: number;
  price: number;
  enroll_open_at: string;
  enroll_close_at?: string;
  activity_at?: string;
  status?: RecommendationSectionItem['status'];
  enroll_count?: number;
  view_count?: number;
  stock_remaining?: number;
  recommend_reason?: string;
}

interface RecommendationApiShape {
  code: number;
  message: string;
  data: {
    list: BackendRecommendationItem[];
    total?: number;
  };
  strategy?: string;
}

function parseTags(value: BackendRecommendationItem['tags']) {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }

  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string');
      }
    } catch {
      return value.split(',').map((item) => item.trim()).filter(Boolean);
    }
  }

  return [];
}

function normalizeItem(item: BackendRecommendationItem): RecommendationSectionItem {
  const maxCapacity = item.max_capacity ?? 0;
  const enrollCount = item.enroll_count ?? 0;

  return {
    id: item.id ?? item.activity_id ?? 0,
    title: item.title,
    description: item.description ?? '',
    coverUrl: item.cover_url ?? null,
    location: item.location,
    category: item.category,
    tags: parseTags(item.tags),
    maxCapacity,
    price: item.price,
    enrollOpenAt: item.enroll_open_at,
    enrollCloseAt: item.enroll_close_at ?? item.enroll_open_at,
    activityAt: item.activity_at ?? item.enroll_open_at,
    status: item.status ?? 'PUBLISHED',
    enrollCount,
    viewCount: item.view_count ?? 0,
    stockRemaining: item.stock_remaining ?? Math.max(maxCapacity - enrollCount, 0),
    recommendReason: item.recommend_reason,
  };
}

export async function getRecommendations(limit = 6): Promise<RecommendationResponse> {
  const response = await api.get<RecommendationApiShape>('/recommendations', {
    params: { limit },
  });

  return {
    list: response.data.data.list.map(normalizeItem),
    strategy: response.data.strategy ?? 'hybrid',
  };
}

export async function getHotRecommendations(limit = 6): Promise<RecommendationSectionItem[]> {
  const response = await api.get<RecommendationApiShape>('/recommendations/hot', {
    params: { limit },
  });

  return response.data.data.list.map(normalizeItem);
}
