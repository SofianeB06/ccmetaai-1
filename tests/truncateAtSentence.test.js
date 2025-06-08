import test from 'node:test';
import assert from 'node:assert/strict';
import { truncateAtSentence } from '../dist/textHelpers.js';

test('cuts at last punctuation mark when available', () => {
  const text = 'Bonjour. Ceci est une phrase complete. Voici une autre phrase';
  const result = truncateAtSentence(text, 50);
  assert.equal(result, 'Bonjour. Ceci est une phrase complete.');
  assert.ok(result.length <= 50);
});

test('falls back to word cut when no punctuation', () => {
  const text = 'Aucune ponctuation ici vraiment';
  const result = truncateAtSentence(text, 20);
  assert.equal(result, 'Aucune ponctuation');
  assert.ok(result.length <= 20);
});

test('ignores early period far from limit', () => {
  const text = 'Hi. Here is some sample text that goes on without any other punctuation in sight';
  const result = truncateAtSentence(text, 60);
  assert.equal(result, 'Hi. Here is some sample text that goes on without any other');
  assert.ok(result.length <= 60);
});

test('period near start leads to word truncation near limit', () => {
  const text =
    'Short. This is a longer piece with no punctuation near the limit whatsoever';
  const result = truncateAtSentence(text, 40);
  assert.equal(result, 'Short. This is a longer piece with no');
  assert.ok(result.length <= 40);
});
