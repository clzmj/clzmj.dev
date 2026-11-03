import type { ProfileAvatar } from '../lib/profile';

// Reserved for the approved company-logo assets; no community count is rendered.
export function AvatarStack({ avatars }: { avatars: ProfileAvatar[] }) {
  if (!avatars.length) return null;
  return (
    <span className="avatar-group">
      <span className="avatar-faces">
        {avatars.map((avatar) => (
          <span key={avatar.label} className="mini-avatar" aria-hidden="true">
            {avatar.src ? <img src={avatar.src} alt="" width={18} height={18} /> : null}
          </span>
        ))}
      </span>
    </span>
  );
}
