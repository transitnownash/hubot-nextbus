/* global describe beforeEach afterEach it expect */

const nock = require('nock');
const Helper = require('./helpers/hubot-helper');

const helper = new Helper([
  './test/adapters/slack.js',
  './src/nextbus.js',
]);

// Alter time as test runs
const originalDateNow = Date.now;

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
  });

  afterEach(() => {
    nock.cleanAll();
    Date.now = originalDateNow;
  });

  describe('regular tests with latitude/longitude set', () => {
    beforeEach(async () => {
      Date.now = () => Date.parse('Mon Feb 02 2026 21:41:49 GMT-0600 (Central Standard Time)');
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
          '⚠️  *Detour in effect on route 3 WEST END FROM DOWNTOWN*\n'
        + '⚠️  *Detour in effect on route 3 WEST END TO DOWNTOWN*',
        ],
        [
          'hubot',
          '🚏 *BROADWAY AVE & 12TH AVE N WB*\n'
        + '```\n'
        + '  9:50 PM    #3 - A -WHITE BRIDGE 🚌   in 9 minutes (On time)\n'
        + '  10:00 PM   #7 - GREEN HILLS          in 19 minutes (On time)\n'
        + '  10:05 PM   #3 - B - BELLEVUE         in 24 minutes (On time)\n'
        + '  10:20 PM   #3 - A -WHITE BRIDGE      in 39 minutes (5m late)\n'
        + '```',
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
          '⚠️  *Detour in effect on route 3 WEST END FROM DOWNTOWN*\n'
        + '⚠️  *Detour in effect on route 3 WEST END TO DOWNTOWN*',
        ],
        [
          'hubot',
          '🚏 *BROADWAY AVE & 12TH AVE N WB*\n'
        + '```\n'
        + '  9:50 PM    #3 - A -WHITE BRIDGE 🚌   in 9 minutes (On time)\n'
        + '  10:00 PM   #7 - GREEN HILLS          in 19 minutes (On time)\n'
        + '  10:05 PM   #3 - B - BELLEVUE         in 24 minutes (On time)\n'
        + '  10:20 PM   #3 - A -WHITE BRIDGE      in 39 minutes (5m late)\n'
        + '```',
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
          '- [BRO12WN] BROADWAY AVE & 12TH AVE N WB\n'
        + '- [BRO12AEF] BROADWAY AVE & 12TH AVE EB\n'
        + '- [11APORSF] 11TH AVE & PORTER ST SB\n'
        + '- [11APORNN] 11TH AVE & PORTER ST NB\n'
        + '- [BRO10AEN] BROADWAY & 10TH AVE EB',
        ],
      ]);
    });
  });
});
