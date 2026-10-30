import type { Metadata } from 'next';
import { ContactView } from '@/components/site/ContactView';
import { JsonLd } from '@/components/site/JsonLd';

export const metadata: Metadata = {
  title: { absolute: 'Contact | Mehrdad — Product Builder' },
  description: 'One clear path to start a conversation: AI/product solutions, projects, collaboration or connecting.',
  alternates: {
    types: { "application/rss+xml": "/feed.xml" },
    canonical: '/contact',
    languages: { en: '/contact', 'x-default': '/contact' },
  },
};

// ContactPage schema (phase-2 SEO gap): marks the page as the official
// contact surface of the Person entity declared on the home-page graph.
const base = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');
const contactSchema = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  '@id': `${base}/contact#contactpage`,
  url: `${base}/contact`,
  name: 'Contact Mehrdad',
  description: 'One clear path to start a conversation: AI/product solutions, projects, collaboration or connecting.',
  inLanguage: 'en',
  mainEntity: { '@id': `${base}/#person` },
};

export default function ContactPage() {
  return (
    <>
      <JsonLd data={contactSchema} />
      <ContactView />
    </>
  );
}
