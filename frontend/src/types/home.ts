import type { ActivityCategory, ActivityListItem } from './activity';

export interface HomeBannerItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  ctaLabel: string;
  href: string;
  imageUrl: string;
  category: ActivityCategory | 'ALL';
}

export interface RecommendationSectionItem extends ActivityListItem {
  recommendReason?: string;
}

export interface HomeCategorySection {
  category: ActivityCategory;
  title: string;
  items: ActivityListItem[];
}
