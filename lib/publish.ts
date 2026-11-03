import { loadProfile } from './profile';
import { absoluteUrl, site } from './site';

export function homeMarkdown(): string {
  const profile = loadProfile();
  const lines = [
    `# ${site.name}`,
    '',
    profile.role,
    '',
    `I'm ${site.name}. I live in ${site.locationLabel}. The employers, logos, and community count on the site are placeholders.`,
    '',
    `You can reach me at [${site.email}](mailto:${site.email}), or see my code on [GitHub](${site.github}).`,
    '',
  ];
  return `${lines.join('\n')}\n`;
}

export function llmsText(): string {
  return `# ${site.name}\n\n> ${site.description}\n\n- [Home in Markdown](${absoluteUrl('/index.md')})\n- [Full profile](${absoluteUrl('/llms-full.txt')})\n- [GitHub](${site.github})\n`;
}
