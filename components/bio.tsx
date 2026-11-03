import { isProfileLink, loadProfile, type ProfileLink, type ProfilePart } from '../lib/profile';
import { site } from '../lib/site';
import { LinkPreview } from './link-preview';

export function Bio() {
  const profile = loadProfile();
  return (
    <div className="bio">
      {profile.paragraphs.map((paragraph) => (
        <p key={paragraphKey(paragraph)}>
          {paragraph.map((part) => (
            <Part
              key={partKey(part)}
              part={part}
              count={profile.community.count}
              avatars={profile.community.avatars}
            />
          ))}
        </p>
      ))}
    </div>
  );
}

function Part({
  part,
  count,
  avatars,
}: {
  part: ProfilePart;
  count: string;
  avatars: { label: string }[];
}) {
  if (typeof part === 'string') return part;
  if ('mail' in part) {
    return <a href={`mailto:${site.email}`}>{site.email}</a>;
  }
  if ('github' in part) {
    return (
      <a href={site.github} rel="noreferrer" target="_blank">
        GitHub
        <span className="visually-hidden"> (opens in a new tab)</span>
      </a>
    );
  }
  if ('avatars' in part) {
    return (
      <span className="avatar-group">
        <span className="avatar-faces" aria-hidden="true">
          {avatars.map((avatar) => (
            <span key={avatar.label} className="mini-avatar">
              {avatar.label}
            </span>
          ))}
        </span>
        <span className="avatar-count">{count}</span>
      </span>
    );
  }
  if (isProfileLink(part)) return <OrgLink link={part} />;
  return null;
}

function OrgLink({ link }: { link: ProfileLink }) {
  return <LinkPreview link={link} />;
}

export function roleLine(): string {
  return loadProfile().role;
}

function paragraphKey(paragraph: ProfilePart[]): string {
  return paragraph.map((part) => partKey(part)).join('|');
}

function partKey(part: ProfilePart): string {
  if (typeof part === 'string') return part;
  if ('mail' in part) return 'mail';
  if ('github' in part) return 'github';
  if ('avatars' in part) return 'avatars';
  return part.label;
}
