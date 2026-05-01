/**
 * BizLegal AI Social Media Accounts Configuration
 * 
 * 7 Platforms for Automated Publishing
 * Business: BizLegal AI
 * Email: ai.leadx10@gmail.com
 */

export interface SocialAccount {
  platform: string
  handle: string
  url?: string
  enabled: boolean
  requiresAuth: boolean
}

export const DOR_INNOVATIONS_SOCIALS: SocialAccount[] = [
  {
    platform: 'facebook',
    handle: 'DorInnovations',
    url: 'https://www.facebook.com/DorInnovations/',
    enabled: true,
    requiresAuth: true,
  },
  {
    platform: 'instagram',
    handle: 'dorinnovations',
    url: 'https://www.instagram.com/dorinnovations/',
    enabled: true,
    requiresAuth: true,
  },
  {
    platform: 'twitter',
    handle: 'DorInnovations',
    url: 'https://x.com/DorInnovations',
    enabled: true,
    requiresAuth: true,
  },
  {
    platform: 'pinterest',
    handle: 'DorInnovations',
    url: 'https://www.pinterest.com/DorInnovations/',
    enabled: true,
    requiresAuth: true,
  },
  {
    platform: 'linkedin',
    handle: 'DorInnovations',
    url: 'https://www.linkedin.com/company/DorInnovations',
    enabled: true,
    requiresAuth: true,
  },
  {
    platform: 'youtube',
    handle: '@DorInnovations',
    url: 'https://www.youtube.com/@DorInnovations',
    enabled: true,
    requiresAuth: true,
  },
  {
    platform: 'substack',
    handle: 'dorinnovations',
    url: 'https://substack.com/@Downloads/dor innovations.png',
    enabled: true,
    requiresAuth: true,
  },
]

export const PLATFORM_CONFIG: Record<string, {
  displayName: string
  maxChars: number
  supportsImages: boolean
  supportsVideo: boolean
  bestPostingTime: string
  hashtagLimit?: number
}> = {
  facebook: {
    displayName: 'Facebook',
    maxChars: 500,
    supportsImages: true,
    supportsVideo: true,
    bestPostingTime: '13:00-16:00',
    hashtagLimit: 3,
  },
  instagram: {
    displayName: 'Instagram',
    maxChars: 300,
    supportsImages: true,
    supportsVideo: true,
    bestPostingTime: '11:00-13:00',
    hashtagLimit: 30,
  },
  twitter: {
    displayName: 'X (Twitter)',
    maxChars: 280,
    supportsImages: true,
    supportsVideo: true,
    bestPostingTime: '12:00-13:00',
    hashtagLimit: 3,
  },
  pinterest: {
    displayName: 'Pinterest',
    maxChars: 500,
    supportsImages: true,
    supportsVideo: false,
    bestPostingTime: '20:00-22:00',
    hashtagLimit: 20,
  },
  linkedin: {
    displayName: 'LinkedIn',
    maxChars: 1300,
    supportsImages: true,
    supportsVideo: true,
    bestPostingTime: '08:00-10:00',
    hashtagLimit: 5,
  },
  youtube: {
    displayName: 'YouTube',
    maxChars: 5000,
    supportsImages: true,
    supportsVideo: true,
    bestPostingTime: '14:00-16:00',
    hashtagLimit: 15,
  },
  substack: {
    displayName: 'Substack',
    maxChars: 10000,
    supportsImages: true,
    supportsVideo: false,
    bestPostingTime: '06:00-08:00',
    hashtagLimit: 10,
  },
}

export function getEnabledPlatforms() {
  return DOR_INNOVATIONS_SOCIALS.filter(account => account.enabled)
}

export function getPlatformUrl(platform: string): string | undefined {
  return DOR_INNOVATIONS_SOCIALS.find(a => a.platform === platform)?.url
}

export function getPlatformHandle(platform: string): string | undefined {
  return DOR_INNOVATIONS_SOCIALS.find(a => a.platform === platform)?.handle
}
