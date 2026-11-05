import { isProfileLink, loadProfile, type ProfilePart } from './profile';
import { absoluteUrl, site } from './site';

export function homeMarkdown(): string {
  const profile = loadProfile();
  return `# ${site.name}\n\n${profile.role}\n\n${profile.paragraphs.map((parts) => parts.map(partMarkdown).join('')).join('\n\n')}\n`;
}

function partMarkdown(part: ProfilePart): string {
  if (typeof part === 'string') return part;
  if ('mail' in part) return `[${site.email}](mailto:${site.email})`;
  if ('github' in part) return `[GitHub](${site.github})`;
  if (isProfileLink(part)) return `[${part.label}](${part.href})`;
  return '';
}

export function llmsText(): string {
  return `# ${site.name}\n\n> ${site.description}\n\n- [Home in Markdown](${absoluteUrl('/index.md')})\n- [Full profile](${absoluteUrl('/llms-full.txt')})\n- [GitHub](${site.github})\n`;
}
