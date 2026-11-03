import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export type ProfileLink = {
  label: string;
  href: string;
  logo: 'square' | 'plus' | 'wave';
  previews: string[];
};

export type ProfilePart =
  | string
  | { mail: true }
  | { github: true }
  | { avatars: true }
  | ProfileLink;

export type Profile = {
  placeholder: boolean;
  note: string;
  role: string;
  community: { count: string; avatars: { label: string }[] };
  paragraphs: ProfilePart[][];
};

export function loadProfile(): Profile {
  const raw = readFileSync(join(process.cwd(), 'content', 'profile.json'), 'utf8');
  return JSON.parse(raw) as Profile;
}

export function isProfileLink(part: ProfilePart): part is ProfileLink {
  return typeof part === 'object' && 'label' in part;
}
