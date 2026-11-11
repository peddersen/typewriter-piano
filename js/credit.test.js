import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('the credit links the wordmark to LinkedIn in a new tab', () => {
  const link = html.match(/<a\b[^>]*class="credit"[^>]*>[\s\S]*?<\/a>/);
  assert.ok(link, 'credit link is missing');
  const tag = link[0];
  assert.match(tag, /href="https:\/\/www\.linkedin\.com\/in\/kaipeters1337\/"/);
  assert.match(tag, /target="_blank"/);
  assert.match(tag, /rel="[^"]*noopener/);
  assert.match(tag, /class="kai-mark"/);
  assert.match(tag, /class="[^"]*\bkai-dot\b[^"]*"/);
  assert.ok(tag.indexOf('kai-mark') > tag.indexOf('credit-label'));
});

test('the page loads Vercel Web Analytics', () => {
  assert.match(html, /window\.vaq/);
  assert.match(html, /defer src="\/_vercel\/insights\/script\.js"/);
});
