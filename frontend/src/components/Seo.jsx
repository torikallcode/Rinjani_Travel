import { useEffect } from 'react';

const SITE_NAME = 'Rinjani Travel';
const DEFAULT_DESCRIPTION =
  'Operator lokal Lombok untuk trekking Gunung Rinjani, island hopping Gili, dan tur budaya dengan guide bersertifikat.';
const DEFAULT_IMAGE = '/img/mnt4.jpg';

function upsertMeta(attr, key, content) {
  if (!content) return;
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function upsertLink(rel, href) {
  if (!href) return;
  let tag = document.head.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute('href', href);
}

function absoluteUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  return `${window.location.origin}${path.startsWith('/') ? path : `/${path}`}`;
}

export default function Seo({ title, description = DEFAULT_DESCRIPTION, image = DEFAULT_IMAGE, jsonLd, noIndex = false }) {
  useEffect(() => {
    const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Trekking Rinjani & Wisata Lombok`;
    document.title = fullTitle;
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:image', absoluteUrl(image));
    upsertMeta('property', 'og:url', window.location.href);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', absoluteUrl(image));
    upsertLink('canonical', window.location.href);
  }, [title, description, image, noIndex]);

  useEffect(() => {
    if (!jsonLd) return undefined;
    const id = 'rinjani-jsonld';
    document.getElementById(id)?.remove();
    const script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    return () => document.getElementById(id)?.remove();
  }, [jsonLd]);

  return null;
}
