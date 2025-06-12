import test from 'node:test';
import assert from 'node:assert/strict';
import { detectLanguage } from '../dist/detectLanguage.js';

const mockAI = (lang) => ({
  models: {
    generateContent: async () => ({ text: lang })
  }
});

test('detects English text', async () => {
  const lang = await detectLanguage('Hello world', mockAI('en'));
  assert.equal(lang, 'en');
});

test('detects French text', async () => {
  const lang = await detectLanguage('Bonjour le monde', mockAI('fr'));
  assert.equal(lang, 'fr');
});
