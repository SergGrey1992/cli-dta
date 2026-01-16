export const TURBOREPO_TEMPLATES = {
  'with-tailwind': {
    name: 'With Tailwind CSS ⭐',
    description: 'Next.js with Tailwind CSS (recommended)',
    url: 'vercel/turborepo/examples/with-tailwind',
  },
  'basic': {
    name: 'Basic',
    description: 'Simple Next.js starter',
    url: 'vercel/turborepo/examples/basic',
  },
  'design-system': {
    name: 'Design System',
    description: 'React component library with Storybook',
    url: 'vercel/turborepo/examples/design-system',
  },
  'with-changesets': {
    name: 'With Changesets',
    description: 'Package versioning and publishing',
    url: 'vercel/turborepo/examples/with-changesets',
  },
  'kitchen-sink': {
    name: 'Kitchen Sink',
    description: 'All features showcase',
    url: 'vercel/turborepo/examples/kitchen-sink',
  },
  'custom': {
    name: 'Custom GitHub URL',
    description: 'Use any GitHub repository (owner/repo/path)',
    url: '',
  },
} as const;

export type TemplateKey = keyof typeof TURBOREPO_TEMPLATES;
