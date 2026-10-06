/**
 * Business-growth runbooks (Task 56) — an owner-specific overlay on top of
 * the upstream library runbooks. These map the four owner goals (startup
 * planning, investor readiness, content production, social media launch)
 * onto verified agent ids from src/data/agency-library.json.
 *
 * Kept separate from the generated bundle so `git pull` + rebuilds of the
 * upstream agency-agents repo never wipe them. Every agent id here MUST
 * exist in the bundle — a check script asserts this in CI/dev.
 */
import type { AgencyRunbook } from './types';

export const GROWTH_RUNBOOKS: AgencyRunbook[] = [
  {
    slug: 'startup-strategy',
    title: 'Startup Strategy & Planning',
    mode: 'Biz-Sprint',
    duration: '1-2 weeks',
    summary:
      'Plan the startup end-to-end: market reality-check, product roadmap, pricing and legal basics before writing code.',
    groups: [
      {
        group: 'Vision & Market',
        activation: 'always',
        agents: [
          'specialized-business-strategist',
          'product-trend-researcher',
          'research-synthesist',
          'specialized-pricing-analyst',
        ],
      },
      {
        group: 'Product & Roadmap',
        activation: 'week 1',
        agents: [
          'product-manager',
          'product-sprint-prioritizer',
          'design-ux-architect',
          'project-management-project-manager-senior',
        ],
      },
      {
        group: 'Numbers & Risk',
        activation: 'week 2',
        agents: [
          'specialized-chief-financial-officer',
          'finance-fpa-analyst',
          'support-legal-compliance-checker',
          'specialized-operations-manager',
        ],
      },
    ],
  },
  {
    slug: 'investor-readiness',
    title: 'Investor Ready Kit',
    mode: 'Fundraise-Sprint',
    duration: '1-2 weeks',
    summary:
      'Get fundraise-ready: numbers that hold up, a pitch that lands, and answers for the diligence questions investors actually ask.',
    groups: [
      {
        group: 'Story & Numbers',
        activation: 'always',
        agents: [
          'specialized-chief-financial-officer',
          'finance-financial-analyst',
          'sales-offer-lead-gen-strategist',
          'specialized-business-strategist',
        ],
      },
      {
        group: 'Pitch Materials',
        activation: 'always',
        agents: [
          'marketing-content-creator',
          'design-visual-storyteller',
          'support-executive-summary-generator',
          'engineering-technical-writer',
        ],
      },
      {
        group: 'Diligence & Defense',
        activation: 'before meetings',
        agents: [
          'support-legal-compliance-checker',
          'finance-investment-researcher',
          'specialized-pricing-analyst',
          'project-management-project-manager-senior',
        ],
      },
    ],
  },
  {
    slug: 'content-factory',
    title: 'Content Factory',
    mode: 'Always-on',
    duration: 'ongoing',
    summary:
      'A repeatable content pipeline: strategy and calendar, production in multiple formats, then SEO and repurposing for reach.',
    groups: [
      {
        group: 'Strategy & Calendar',
        activation: 'monthly',
        agents: ['marketing-content-creator', 'marketing-seo-specialist', 'product-trend-researcher'],
      },
      {
        group: 'Production',
        activation: 'weekly',
        agents: [
          'design-visual-storyteller',
          'design-image-prompt-engineer',
          'engineering-technical-writer',
          'marketing-email-strategist',
        ],
      },
      {
        group: 'SEO & Repurpose',
        activation: 'per piece',
        agents: [
          'marketing-seo-specialist',
          'marketing-video-optimization-specialist',
          'marketing-ai-citation-strategist',
          'support-analytics-reporter',
        ],
      },
    ],
  },
  {
    slug: 'social-launch-engine',
    title: 'Social Launch Engine',
    mode: 'Campaign',
    duration: '2-4 weeks',
    summary:
      'Launch and grow on social platforms: platform plan, native content per network, community building and paid boost.',
    groups: [
      {
        group: 'Platform Plan',
        activation: 'always',
        agents: [
          'marketing-social-media-strategist',
          'marketing-x-twitter-intelligence-analyst',
          'marketing-linkedin-content-creator',
        ],
      },
      {
        group: 'Content Engine',
        activation: 'weekly',
        agents: [
          'marketing-carousel-growth-engine',
          'marketing-short-video-editing-coach',
          'marketing-tiktok-strategist',
          'marketing-global-podcast-strategist',
        ],
      },
      {
        group: 'Community & Growth',
        activation: 'always',
        agents: [
          'marketing-reddit-community-builder',
          'marketing-developer-community-builder',
          'marketing-growth-hacker',
          'paid-media-paid-social-strategist',
        ],
      },
      {
        group: 'Measure & Iterate',
        activation: 'weekly',
        agents: ['support-analytics-reporter', 'marketing-pr-communications-manager'],
      },
    ],
  },
];

/** Assert every referenced agent id exists in the bundle (fail fast at boot). */
export function validateGrowthRunbooks(agentIds: Set<string>): string[] {
  const missing: string[] = [];
  for (const rb of GROWTH_RUNBOOKS) {
    for (const g of rb.groups) {
      for (const id of g.agents) {
        if (!agentIds.has(id)) missing.push(`${rb.slug}:${id}`);
      }
    }
  }
  return missing;
}
