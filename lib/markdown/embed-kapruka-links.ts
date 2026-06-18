import { KAPRUKA_BASE_URL } from '@/constants/urls';

const MARKDOWN_LINK = /(\[[^\]]*\]\([^)]+\))/g;

/** Turn bare "Kapruka" mentions into markdown links without touching existing links. */
export function embedKaprukaLinks(markdown: string): string {
  return markdown
    .split(MARKDOWN_LINK)
    .map((segment, index) => {
      if (index % 2 === 1) return segment;
      return segment.replace(
        /\bKapruka\b/gi,
        (match) => `[${match}](${KAPRUKA_BASE_URL})`,
      );
    })
    .join('');
}
