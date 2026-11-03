import type { MetadataRoute } from 'next';
import { site } from '../lib/site';

const agents = [
  '*',
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'Google-Extended',
  'GoogleOther',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'PerplexityBot',
  'CCBot',
  'Bytespider',
  'Applebot-Extended',
  'Amazonbot',
  'Meta-ExternalAgent',
  'FacebookBot',
  'Diffbot',
  'cohere-ai',
];

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: agents.map((userAgent) => ({ userAgent, allow: '/' })),
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
