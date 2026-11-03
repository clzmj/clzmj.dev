import type { ProfileAvatar } from '../lib/profile';

export function AvatarStack({ avatars }: { avatars: ProfileAvatar[] }) {
  if (!avatars.length) return null;
  return (
    <span className="avatar-group">
      <span className="avatar-faces">
        {avatars.map((avatar, index) => (
          <a
            key={avatar.label}
            className="mini-avatar"
            href={avatar.href}
            target="_blank"
            rel="noopener"
            aria-label={avatar.label}
            title={avatar.label}
            style={{ zIndex: avatars.length - index }}
          >
            <img src={avatar.src} alt="" width={20} height={20} />
          </a>
        ))}
      </span>
    </span>
  );
}
