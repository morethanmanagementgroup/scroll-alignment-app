import { test } from 'node:test'
import assert from 'node:assert/strict'
import { chooseInstant, resolveLocalTime } from './time'

test('ordinary time resolves to one instant', () => {
  const r = resolveLocalTime('1990-07-04', '14:30', 'America/New_York')
  assert.equal(r.status, 'ok')
  if (r.status === 'ok') { assert.equal(r.utc, '1990-07-04T18:30:00.000Z'); assert.equal(r.offsetSeconds, -4 * 3600) }
})

test('US spring-forward gap is reported as nonexistent with both readings', () => {
  const r = resolveLocalTime('2021-03-14', '02:30', 'America/New_York')
  assert.equal(r.status, 'nonexistent')
  if (r.status === 'nonexistent') {
    assert.equal(r.offsetBeforeSeconds, -5 * 3600)
    assert.equal(r.offsetAfterSeconds, -4 * 3600)
    assert.equal(r.candidates.find(c => c.rule === 'offset-before')!.utc, '2021-03-14T07:30:00.000Z')
    assert.equal(r.candidates.find(c => c.rule === 'offset-after')!.utc, '2021-03-14T06:30:00.000Z')
  }
  assert.equal(chooseInstant(r, null), null, 'a choice is required')
})

test('US fall-back fold is reported as ambiguous, earlier first', () => {
  const r = resolveLocalTime('2021-11-07', '01:30', 'America/New_York')
  assert.equal(r.status, 'ambiguous')
  if (r.status === 'ambiguous') {
    assert.deepEqual(r.candidates.map(c => c.utc), ['2021-11-07T05:30:00.000Z', '2021-11-07T06:30:00.000Z'])
  }
  assert.equal(chooseInstant(r, 'later')!.utc, '2021-11-07T06:30:00.000Z')
  assert.equal(chooseInstant(r, 'offset-after'), null, 'wrong kind of choice is rejected')
})

test('historical rules: US war time 1944 (UTC−4 in January)', () => {
  const r = resolveLocalTime('1944-01-15', '12:00', 'America/New_York')
  assert.equal(r.status, 'ok')
  if (r.status === 'ok') assert.equal(r.offsetSeconds, -4 * 3600)
})

test('historical rules: British Standard Time 1969 (UTC+1 in winter)', () => {
  const r = resolveLocalTime('1969-01-15', '12:00', 'Europe/London')
  assert.equal(r.status, 'ok')
  if (r.status === 'ok') assert.equal(r.offsetSeconds, 3600)
})

test('half-hour and 45-minute zones', () => {
  const k = resolveLocalTime('2000-06-01', '09:00', 'Asia/Kolkata')
  const n = resolveLocalTime('2000-06-01', '09:00', 'Asia/Kathmandu')
  assert.equal(k.status === 'ok' && k.offsetSeconds, 5.5 * 3600)
  assert.equal(n.status === 'ok' && n.offsetSeconds, 5.75 * 3600)
})

test('Lord Howe Island 30-minute DST fold', () => {
  const r = resolveLocalTime('2021-04-04', '01:45', 'Australia/Lord_Howe')
  assert.equal(r.status, 'ambiguous')
})

test('Samoa skipped the whole of 30 Dec 2011', () => {
  const r = resolveLocalTime('2011-12-30', '12:00', 'Pacific/Apia')
  assert.equal(r.status, 'nonexistent')
})

test('invalid inputs', () => {
  assert.equal(resolveLocalTime('1990-02-30', '10:00', 'UTC').status, 'invalid')
  assert.equal(resolveLocalTime('1990-01-01', '25:00', 'UTC').status, 'invalid')
  assert.equal(resolveLocalTime('1990-01-01', '10:00', 'Mars/Olympus').status, 'invalid')
  assert.equal(resolveLocalTime('1700-01-01', '10:00', 'UTC').status, 'invalid')
})
