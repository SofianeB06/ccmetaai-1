import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCSV } from '../dist/csvParser.js';

class MockFileReader {
  constructor() {
    this.onload = null;
    this.onerror = null;
  }
  readAsText(file) {
    file.text().then(text => {
      if (this.onload) this.onload({ target: { result: text } });
    }).catch(err => {
      if (this.onerror) this.onerror(err);
    });
  }
}

class FailingFileReader {
  constructor() {
    this.onload = null;
    this.onerror = null;
  }
  readAsText() {
    if (this.onerror) this.onerror(new Error('fail'));
  }
}

test('parses newline separated URLs', async () => {
  global.FileReader = MockFileReader;
  const file = new File(['https://example.com\nhttps://openai.com'], 'urls.csv');
  const urls = await parseCSV(file);
  assert.deepEqual(urls, ['https://example.com', 'https://openai.com']);
});

test('parses comma separated URLs using first column', async () => {
  global.FileReader = MockFileReader;
  const file = new File([
    'https://a.com,first\nhttps://b.com,second'
  ], 'urls.csv');
  const urls = await parseCSV(file);
  assert.deepEqual(urls, ['https://a.com', 'https://b.com']);
});

test('rejects when file is empty', async () => {
  global.FileReader = MockFileReader;
  const file = new File([''], 'empty.csv');
  await assert.rejects(() => parseCSV(file), {
    message: 'File is empty or could not be read.'
  });
});

test('rejects when no valid URLs found', async () => {
  global.FileReader = MockFileReader;
  const file = new File(['not,a,url'], 'bad.csv');
  await assert.rejects(() => parseCSV(file), {
    message: 'No valid URLs found in the CSV file. Ensure URLs start with http:// or https:// and are in the first column or one per line.'
  });
});

test('rejects on read error', async () => {
  global.FileReader = FailingFileReader;
  const file = new File(['https://example.com'], 'urls.csv');
  await assert.rejects(() => parseCSV(file), { message: 'Failed to read file.' });
});
