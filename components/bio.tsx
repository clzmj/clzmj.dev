import { isProfileLink, loadProfile, type ProfileLink, type ProfilePart } from '../lib/profile';
import type { ProfileAvatar } from '../lib/profile';
import { site } from '../lib/site';
import { AvatarStack } from './avatar-stack';
import { LinkPreview } from './link-preview';

export function Bio() {
  const profile = loadProfile();
  return (
    <div className="bio">
      {profile.paragraphs.map((paragraph) => (
        <p key={paragraphKey(paragraph)}>
          {paragraph.map((part, index) => {
            if (isProfileLink(part)) {
              const next = paragraph[index + 1];
              const punctuation = typeof next === 'string' ? next.match(/^[,.;:!?]+/)?.[0] : '';
              return (
                <span className="company-link whitespace-nowrap" key={partKey(part)}>
                  <Part part={part} avatars={profile.avatarStack} />
                  {punctuation}
                </span>
              );
            }
            const previous = paragraph[index - 1];
            const text =
              typeof part === 'string' && previous && isProfileLink(previous)
                ? part.replace(/^[,.;:!?]+/, '')
                : part;
            return <Part key={partKey(part)} part={text} avatars={profile.avatarStack} />;
          })}
        </p>
      ))}
    </div>
  );
}

function Part({ part, avatars }: { part: ProfilePart; avatars: ProfileAvatar[] }) {
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
  if ('avatars' in part) return <AvatarStack avatars={avatars} />;
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
