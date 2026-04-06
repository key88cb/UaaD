export type ActivityCategory =
  | 'CONCERT'
  | 'THEATER'
  | 'SPORTS'
  | 'CHILDREN'
  | 'EXHIBITION'
  | 'MUSIC'
  | 'DANCE'
  | 'OTHER';

export type ActivityStatus =
  | 'DRAFT'
  | 'PREHEAT'
  | 'PUBLISHED'
  | 'SELLING_OUT'
  | 'SOLD_OUT'
  | 'OFFLINE'
  | 'CANCELLED';

export type ActivitySort = 'relevance' | 'hot' | 'soon' | 'recent';

export interface ActivityListItem {
  id: number;
  title: string;
  description: string;
  coverUrl: string | null;
  location: string;
  category: ActivityCategory;
  tags: string[];
  maxCapacity: number;
  price: number;
  enrollOpenAt: string;
  enrollCloseAt: string;
  activityAt: string;
  status: ActivityStatus;
  enrollCount: number;
  viewCount: number;
  stockRemaining: number;
  artistMatches?: string[];
}

export interface ActivitySearchParams {
  keyword: string;
  region: string;
  artist: string;
  category: ActivityCategory | 'ALL';
  sort: ActivitySort;
  page: number;
  pageSize: number;
}

export interface ActivitySearchResult {
  list: ActivityListItem[];
  total: number;
  page: number;
  pageSize: number;
}
