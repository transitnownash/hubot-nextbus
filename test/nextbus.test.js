/* eslint-disable func-names */
/* global describe beforeEach afterEach context it */

const Helper = require('hubot-test-helper');
const chai = require('chai');
const nock = require('nock');

const {
  expect,
} = chai;

const helper = new Helper('../src/nextbus.js');

// Alter time as test runs
const originalDateNow = Date.now;

describe('hubot-nextbus', () => {
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
      .get('/stops/PORGRESF/next.json')
      .replyWithFile(200, `${__dirname}/fixtures/stops-PORGRESF-next.json`);
  });

  afterEach(() => {
    nock.cleanAll();
    Date.now = originalDateNow;
  });

  context('regular tests with latitude/longitude set', () => {
    beforeEach(function () {
      Date.now = () => Date.parse('Mon Feb 02 2026 21:41:49 GMT-0600 (Central Standard Time)');
      process.env.HUBOT_NEXTBUS_LAT_LON = '36.156751,-86.787397';
      this.room = helper.createRoom();
    });

    afterEach(function () {
      this.room.destroy();
      delete process.env.HUBOT_NEXTBUS_LAT_LON;
    });

    // hubot nextbus
    it('returns the next bus for closest stop', function (done) {
      const selfRoom = this.room;
      selfRoom.user.say('alice', '@hubot nextbus');
      setTimeout(
        () => {
          try {
            expect(selfRoom.messages).to.eql([
              ['alice', '@hubot nextbus'],
              [
                'hubot',
                '⚠️  *Detour in effect on route 3 WEST END FROM DOWNTOWN*\n'
              + '⚠️  *Detour in effect on route 3 WEST END TO DOWNTOWN*',
              ],
              [
                'hubot',
                '🚏 *BROADWAY AVE & 12TH AVE N WB*\n'
              + '  9:50 PM    #3 - A -WHITE BRIDGE 🚌   in 9 minutes (On time)\n'
              + '  10:00 PM   #7 - GREEN HILLS          in 19 minutes (On time)\n'
              + '  10:05 PM   #3 - B - BELLEVUE         in 24 minutes (On time)\n'
              + '  10:20 PM   #3 - A -WHITE BRIDGE      in 39 minutes (5m late)',
              ],
            ]);
            done();
          } catch (err) {
            done(err);
          }
        },
        100,
      );
    });

    // hubot nextbus stop <id>
    it('returns the next bus for a particular stop', function (done) {
      const selfRoom = this.room;
      selfRoom.user.say('alice', '@hubot nextbus stop BRO12WN');
      setTimeout(
        () => {
          try {
            expect(selfRoom.messages).to.eql([
              ['alice', '@hubot nextbus stop BRO12WN'],
              [
                'hubot',
                '⚠️  *Detour in effect on route 3 WEST END FROM DOWNTOWN*\n'
              + '⚠️  *Detour in effect on route 3 WEST END TO DOWNTOWN*',
              ],
              [
                'hubot',
                '🚏 *BROADWAY AVE & 12TH AVE N WB*\n'
              + '  9:50 PM    #3 - A -WHITE BRIDGE 🚌   in 9 minutes (On time)\n'
              + '  10:00 PM   #7 - GREEN HILLS          in 19 minutes (On time)\n'
              + '  10:05 PM   #3 - B - BELLEVUE         in 24 minutes (On time)\n'
              + '  10:20 PM   #3 - A -WHITE BRIDGE      in 39 minutes (5m late)',
              ],
            ]);
            done();
          } catch (err) {
            done(err);
          }
        },
        100,
      );
    });

    // hubot nextbus stops
    it('returns the list of nearby stops', function (done) {
      const selfRoom = this.room;
      selfRoom.user.say('alice', '@hubot nextbus stops');
      setTimeout(
        () => {
          try {
            expect(selfRoom.messages).to.eql([
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
            done();
          } catch (err) {
            done(err);
          }
        },
        100,
      );
    });
  });

  context('regular tests with default stop ID set', () => {
    beforeEach(function () {
      Date.now = () => Date.parse('Mon Feb 02 2026 21:41:49 GMT-0600 (Central Standard Time)');
      process.env.HUBOT_NEXTBUS_LAT_LON = '0,0';
      process.env.HUBOT_NEXTBUS_STOP_ID = 'BRO12WN';
      this.room = helper.createRoom();
    });

    afterEach(function () {
      this.room.destroy();
      delete process.env.HUBOT_NEXTBUS_LAT_LON;
      delete process.env.HUBOT_NEXTBUS_STOP_ID;
    });

    // hubot nextbus
    it('returns the next bus for closest stop', function (done) {
      const selfRoom = this.room;
      selfRoom.user.say('alice', '@hubot nextbus');
      setTimeout(
        () => {
          try {
            expect(selfRoom.messages).to.eql([
              ['alice', '@hubot nextbus'],
              [
                'hubot',
                '⚠️  *Detour in effect on route 3 WEST END FROM DOWNTOWN*\n'
              + '⚠️  *Detour in effect on route 3 WEST END TO DOWNTOWN*'],
              [
                'hubot',
                '🚏 *BROADWAY AVE & 12TH AVE N WB*\n'
              + '  9:50 PM    #3 - A -WHITE BRIDGE 🚌   in 9 minutes (On time)\n'
              + '  10:00 PM   #7 - GREEN HILLS          in 19 minutes (On time)\n'
              + '  10:05 PM   #3 - B - BELLEVUE         in 24 minutes (On time)\n'
              + '  10:20 PM   #3 - A -WHITE BRIDGE      in 39 minutes (5m late)',
              ],
            ]);
            done();
          } catch (err) {
            done(err);
          }
        },
        100,
      );
    });
  });

  context('time spans days', () => {
    beforeEach(function () {
      Date.now = () => Date.parse('Mon Feb 02 2026 23:53:49 GMT-0600 (Central Standard Time)');
      this.room = helper.createRoom();
    });

    afterEach(function () {
      this.room.destroy();
    });

    it('returns the next bus for specific stop', function (done) {
      const selfRoom = this.room;
      selfRoom.user.say('alice', '@hubot nextbus stop PORGRESF');
      setTimeout(
        () => {
          try {
            expect(selfRoom.messages).to.eql([
              ['alice', '@hubot nextbus stop PORGRESF'],
              [
                'hubot',
                '🚏 *PORTER RD & GREENWOOD AVE SB*\n'
              + '  12:48 AM   #4 - DOWNTOWN      in an hour\n'
              + '  1:48 AM    #4 - SHELBY PARK   in 2 hours',
              ],
            ]);
            done();
          } catch (err) {
            done(err);
          }
        },
        100,
      );
    });
  });
});
