import { test } from 'node:test'
import assert from 'node:assert/strict'
import { base64UrlEncode, rawMessage } from './index'

test('base64UrlEncode strips padding and url-safes', () => {
  assert.ok(!base64UrlEncode('test').includes('='))
})

test('rawMessage builds mime text', () => {
  const raw = rawMessage('a@b.com', 'c@d.com', 'Hi', 'Hello')
  assert.ok(raw.includes('From: a@b.com'))
  assert.ok(raw.includes('Subject: =?UTF-8'))
  assert.ok(raw.includes('Hello'))
})
