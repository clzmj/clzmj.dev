'use client';

import { useLayoutEffect, useRef, useState } from 'react';

import { socialProfiles } from '../lib/social';

type SocialProfile = (typeof socialProfiles)[number];

export function SocialCards() {
  return (
    <section className="section social-cards" aria-label="Social profiles">
      {socialProfiles.map((profile) => (
        <SocialCard key={profile.platform} profile={profile} />
      ))}
    </section>
  );
}

function SocialCard({ profile }: { profile: SocialProfile }) {
  const bannerRef = useRef<HTMLImageElement>(null);
  const avatarRef = useRef<HTMLImageElement>(null);
  const [bannerFailed, setBannerFailed] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  useLayoutEffect(() => {
    // Image errors can happen before hydration attaches onError handlers.
    if (bannerRef.current?.complete && bannerRef.current.naturalWidth === 0) setBannerFailed(true);
    if (avatarRef.current?.complete && avatarRef.current.naturalWidth === 0) setAvatarFailed(true);
  }, []);
  return (
    <a
      className="social-card"
      href={profile.href}
      target="_blank"
      rel="noopener"
      data-platform={profile.platform}
    >
      <div className="social-banner" data-fallback={bannerFailed} aria-hidden="true">
        {!bannerFailed ? (
          <img
            ref={bannerRef}
            src={profile.banner}
            alt=""
            width={900}
            height={300}
            onError={() => setBannerFailed(true)}
          />
        ) : null}
        <span className="social-platform">
          <PlatformLogo platform={profile.platform} />
        </span>
        <span className="social-avatar">
          {avatarFailed ? (
            <span>CL</span>
          ) : (
            <img
              ref={avatarRef}
              src={profile.avatar}
              alt=""
              width={64}
              height={64}
              onError={() => setAvatarFailed(true)}
            />
          )}
        </span>
      </div>
      <div className="social-caption">
        <span className="social-name">{profile.name}</span>
        <span className="social-handle">{profile.handle}</span>
      </div>
      <span className="visually-hidden">{profile.label} (opens in a new tab)</span>
    </a>
  );
}

function PlatformLogo({ platform }: { platform: SocialProfile['platform'] }) {
  return platform === 'x' ? (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.6 5.5 22H2.3l7.9-9L.8 2h6.5l5.9 7.8L18.9 2Zm-1.1 18h1.8L6.3 4H4.4l13.4 16Z" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
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
