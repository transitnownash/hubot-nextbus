/* global describe beforeEach afterEach it expect */

const nock = require('nock');
const Helper = require('./helpers/hubot-helper');

const helper = new Helper([
  './test/adapters/slack.js',
  './src/nextbus.js',
]);

// Alter time as test runs
const originalDateNow = Date.now;

const tripTableBlocks = (heading, rows) => ({
  blocks: [
    {
      type: 'header',
      text: { type: 'plain_text', text: heading, emoji: true },
    },
    {
      type: 'table',
      rows: [['Time', 'Route', 'ETA'], ...rows].map((row) => row.map((cell) => ({
        type: 'raw_text',
        text: cell,
      }))),
    },
  ],
});

describe('hubot-nextbus for slack', () => {
  let room = null;

  beforeEach(() => {
    nock.disableNetConnect();
    nock('https://gtfs.transitnownash.org')
      .get('/stops/near/36.156751,-86.787397/1000.json?per_page=5')
      .replyWithFile(200, `${__dirname}/fixtures/stops-near-gps.json`);
    nock('https://gtfs.transitnownash.org')
      .get('/agencies.json')
      .replyWithFile(200, `${__dirname}/fixtures/agencies.json`);
    nock('https://gtfs.transitnownash.org')
      .get('/stops/BRO12WN/next.json')
      .replyWithFile(200, `${__dirname}/fixtures/stops-BRO12WN-next.json`);
    nock('https://gtfs.transitnownash.org')
      .get('/stops/489/next.json')
      .replyWithFile(200, `${__dirname}/fixtures/stops-BRO12WN-next.json`);
  });

  afterEach(() => {
    nock.cleanAll();
    Date.now = originalDateNow;
  });

  describe('regular tests with latitude/longitude set', () => {
    beforeEach(async () => {
      Date.now = () => Date.parse('Sun Aug 30 2026 12:58:00 GMT-0500 (Central Daylight Time)');
      process.env.HUBOT_NEXTBUS_LAT_LON = '36.156751,-86.787397';
      room = await helper.createRoom();
    });

    afterEach(() => {
      room.destroy();
      delete process.env.HUBOT_NEXTBUS_LAT_LON;
    });

    // hubot nextbus
    it('returns the next bus for closest stop', async () => {
      await room.user.say('alice', '@hubot nextbus');
      await room.waitForMessages(3);
      expect(room.messages).toEqual([
        ['alice', '@hubot nextbus'],
        [
          'hubot',
          '⚠️  *6TH AVE & DEADERICK ST SB is not currently being served due to Construction.*\n'
        + '⚠️  *Detour in effect on route 7 HILLSBORO TO DOWNTOWN*\n'
        + '⚠️  *Detour in effect on route 7 HILLSBORO FROM DOWNTOWN*',
        ],
        [
          'hubot',
          tripTableBlocks('🚏 BROADWAY AVE & 12TH AVE N WB', [
            ['1:01 PM', '#7 - GREEN HILLS 🚌', 'in 4 minutes (On time)'],
            ['1:06 PM', '#3 - B - BELLEVUE 🚌', 'in 9 minutes (On time)'],
            ['1:21 PM', '#3 - A -WHITE BRIDGE', 'in 24 minutes (On time)'],
            ['1:21 PM', '#7 - GREEN HILLS', 'in 24 minutes (On time)'],
          ]),
        ],
      ]);
    });

    // hubot nextbus stop <id>
    it('returns the next bus for a particular stop', async () => {
      await room.user.say('alice', '@hubot nextbus stop BRO12WN');
      await room.waitForMessages(3);
      expect(room.messages).toEqual([
        ['alice', '@hubot nextbus stop BRO12WN'],
        [
          'hubot',
          '⚠️  *6TH AVE & DEADERICK ST SB is not currently being served due to Construction.*\n'
        + '⚠️  *Detour in effect on route 7 HILLSBORO TO DOWNTOWN*\n'
        + '⚠️  *Detour in effect on route 7 HILLSBORO FROM DOWNTOWN*',
        ],
        [
          'hubot',
          tripTableBlocks('🚏 BROADWAY AVE & 12TH AVE N WB', [
            ['1:01 PM', '#7 - GREEN HILLS 🚌', 'in 4 minutes (On time)'],
            ['1:06 PM', '#3 - B - BELLEVUE 🚌', 'in 9 minutes (On time)'],
            ['1:21 PM', '#3 - A -WHITE BRIDGE', 'in 24 minutes (On time)'],
            ['1:21 PM', '#7 - GREEN HILLS', 'in 24 minutes (On time)'],
          ]),
        ],
      ]);
    });

    // hubot nextbus stops
    it('returns the list of nearby stops', async () => {
      await room.user.say('alice', '@hubot nextbus stops');
      await room.waitForMessages(3);
      expect(room.messages).toEqual([
        ['alice', '@hubot nextbus stops'],
        ['hubot', 'List of nearby stops:'],
        [
          'hubot',
          '- `#489` - BROADWAY AVE & 12TH AVE N WB\n'
        + '- `#4588` - BROADWAY AVE & 12TH AVE EB\n'
        + '- `#5275` - 11TH AVE & PORTER ST SB\n'
        + '- `#5281` - 11TH AVE & PORTER ST NB\n'
        + '- `#4825` - BROADWAY & 10TH AVE EB',
        ],
      ]);
    });
  });
});
