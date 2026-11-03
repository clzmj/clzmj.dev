import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export type ProfileLink = {
  label: string;
  href: string;
  previews?: string[];
};

export type ProfilePart =
  | string
  | { mail: true }
  | { github: true }
  | { avatars: true }
  | ProfileLink;

export type ProfileAvatar = { label: string; href: string; src: string };

export type Profile = {
  role: string;
  avatarStack: ProfileAvatar[];
  paragraphs: ProfilePart[][];
};

export function loadProfile(): Profile {
  const raw = readFileSync(join(process.cwd(), 'content', 'profile.json'), 'utf8');
  return JSON.parse(raw) as Profile;
}

export function isProfileLink(part: ProfilePart): part is ProfileLink {
  return typeof part === 'object' && 'label' in part;
}
