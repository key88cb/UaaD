import type { HomeBannerItem } from '../types';

export const HOME_BANNERS: HomeBannerItem[] = [
  {
    id: 'masters',
    title: '致敬巨匠',
    subtitle: '从达芬奇到卡拉瓦乔',
    description: '文艺复兴名作展，沉浸式重构大师创作现场。',
    ctaLabel: '查看展览',
    href: '/activities?category=EXHIBITION&keyword=%E8%BE%BE%E8%8A%AC%E5%A5%87',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1400&q=80',
    category: 'EXHIBITION',
  },
  {
    id: 'stadium',
    title: '年度万人演唱会',
    subtitle: '抢先锁定黄金座位',
    description: '顶流艺人全国巡演开启，第一时间发现最热站次。',
    ctaLabel: '立即看看',
    href: '/activities?category=CONCERT&sort=hot',
    imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1400&q=80',
    category: 'CONCERT',
  },
  {
    id: 'sports',
    title: '城市体育热榜',
    subtitle: '赛事、俱乐部与主场体验',
    description: '从职业联赛到城市赛事，按地区快速找到下一个现场。',
    ctaLabel: '浏览体育',
    href: '/activities?category=SPORTS&sort=soon',
    imageUrl: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1400&q=80',
    category: 'SPORTS',
  },
];
