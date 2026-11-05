import { socialProfiles } from '../lib/social';

type Platform = (typeof socialProfiles)[number]['platform'];

export function FooterSocialLinks() {
  return socialProfiles.map((profile) => {
    const label = `${profile.label} (${profile.handle})`;
    return (
      <a
        key={profile.platform}
        className="footer-social-link footer-icon-control"
        href={profile.href}
        aria-label={label}
        title={label}
        target="_blank"
        rel="noopener noreferrer"
      >
        <PlatformLogo platform={profile.platform} />
      </a>
    );
  });
}

function PlatformLogo({ platform }: { platform: Platform }) {
  if (platform === 'x') {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.6 5.5 22H2.3l7.9-9L.8 2h6.5l5.9 7.8L18.9 2Zm-1.1 18h1.8L6.3 4H4.4l13.4 16Z" />
      </svg>
    );
  }
  if (platform === 'instagram') {
    return (
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M5.4 7.2a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6ZM3.8 9h3.3v11H3.8V9Zm5.4 0h3.2v1.5c.7-1.1 1.8-1.8 3.4-1.8 3 0 4.2 1.9 4.2 5V20h-3.3v-5.7c0-1.7-.6-2.7-1.9-2.7-1.5 0-2.3 1-2.3 2.7V20H9.2V9Z" />
    </svg>
  );
}
