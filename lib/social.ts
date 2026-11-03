import { site } from './site';

export const socialProfiles = [
  {
    platform: 'x',
    label: 'X',
    name: site.name,
    handle: '@clzmj',
    href: 'https://x.com/clzmj',
    banner: '/social/x-banner.svg',
    avatar: '/social/x-avatar.png',
  },
  {
    platform: 'instagram',
    label: 'Instagram',
    name: site.name,
    handle: '@TODO',
    // Replace this placeholder destination when the Instagram handle is supplied.
    href: 'https://www.instagram.com/',
    banner: '/social/instagram-banner.svg',
    avatar: '/social/instagram-avatar.png',
  },
] as const;
