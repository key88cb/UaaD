import type { RecommendationSectionItem } from './home';

export interface RecommendationResponse {
  list: RecommendationSectionItem[];
  strategy: string;
}
