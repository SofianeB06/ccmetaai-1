import test from 'node:test';
import assert from 'node:assert/strict';
import { truncateAtWord } from '../dist/textHelpers.js';

test('returns text unchanged when under limit', () => {
  const text = 'Short text';
  assert.equal(truncateAtWord(text, 20), text);
});

test('truncates at last space before limit', () => {
  const text = 'Hello world from Codex';
  const result = truncateAtWord(text, 13); // substring would be 'Hello world f'
  assert.equal(result, 'Hello world');
  assert.ok(result.length <= 13);
});

test('falls back to hard cut when no space', () => {
  const text = 'abcdefghijk';
  const result = truncateAtWord(text, 5);
  assert.equal(result, 'abcde');
  assert.ok(result.length <= 5);
});
