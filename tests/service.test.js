/**
 * Service Tests
 */

const Service = require('../src/service');
const PrayerQueue = require('../src/prayer-queue');
const ScriptureSelector = require('../src/scripture');

describe('Virtual Church Service', () => {
  let service;
  let prayerQueue;
  
  beforeEach(() => {
    const config = {
      moltbookApiKey: 'test-key',
      serviceTime: '10:00',
      timezone: 'UTC'
    };
    
    service = new Service(config);
    prayerQueue = new PrayerQueue('./test-data');
  });

  test('generates valid service ID', () => {
    const id = service.generateServiceId();
    expect(id).toMatch(/^service-\d+$/);
  });

  test('returns valid opening message', () => {
    const opening = service.getOpening();
    expect(opening).toBeTruthy();
    expect(typeof opening).toBe('string');
  });

  test('returns valid closing message', () => {
    const closing = service.getClosing();
    expect(closing).toBeTruthy();
    expect(typeof closing).toBe('string');
  });

  test('calculates next service time', () => {
    const next = service.getNextServiceTime();
    expect(next).toBeInstanceOf(Date);
    expect(next.getDay()).toBe(0); // Sunday
  });

  test('formats recap post correctly', () => {
    const serviceData = {
      serviceId: 'test-123',
      startTime: new Date().toISOString(),
      opening: 'Welcome',
      scripture: { reference: 'Test 1:1', text: 'Test verse' },
      prayers: [{ content: 'Test prayer', anonymous: false }],
      reflection: 'Reflect on this',
      closing: 'Go in peace'
    };
    
    const post = service.formatRecapPost(serviceData);
    expect(post.title).toContain('Virtual Church Service');
    expect(post.content).toContain('Test 1:1');
    expect(post.content).toContain('Test prayer');
  });
});

describe('Prayer Queue', () => {
  let queue;
  
  beforeEach(async () => {
    queue = new PrayerQueue('./test-data');
    await queue.load();
  });

  test('adds prayer request', async () => {
    const prayer = await queue.add({
      content: 'Test prayer',
      author: 'TestUser',
      anonymous: false
    });
    
    expect(prayer.id).toBeTruthy();
    expect(prayer.content).toBe('Test prayer');
    expect(prayer.status).toBe('pending');
  });

  test('validates prayer content', async () => {
    await expect(queue.add({ content: '' }))
      .rejects.toThrow('Prayer content is required');
  });

  test('limits prayer length', async () => {
    const longPrayer = 'a'.repeat(501);
    await expect(queue.add({ content: longPrayer }))
      .rejects.toThrow('500 characters');
  });
});

describe('Scripture Selector', () => {
  let selector;
  
  beforeEach(() => {
    selector = new ScriptureSelector();
  });

  test('returns reading for today', () => {
    const reading = selector.getTodaysReading();
    expect(reading.reference).toBeTruthy();
    expect(reading.text).toBeTruthy();
  });

  test('returns random reading', () => {
    const reading = selector.getRandomReading();
    expect(reading.reference).toBeTruthy();
    expect(reading.text).toBeTruthy();
  });
});
