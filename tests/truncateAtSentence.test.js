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
