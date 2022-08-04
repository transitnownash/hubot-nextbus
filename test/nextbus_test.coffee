Helper = require('hubot-test-helper')
chai = require 'chai'
nock = require 'nock'

expect = chai.expect

helper = new Helper('../src/nextbus.coffee')

# Alter time as test runs
originalDateNow = Date.now

describe 'hubot-nextbus', ->
  beforeEach ->
    nock.disableNetConnect()
    nock('https://gtfs.transitnownash.org')
      .get('/stops/near/36.1650,-86.78404/1000.json?per_page=5')
      .replyWithFile(200, __dirname + '/fixtures/stops-near-gps.json')
    nock('https://gtfs.transitnownash.org')
      .get('/agencies.json')
      .replyWithFile(200, __dirname + '/fixtures/agencies.json')
    nock('https://gtfs.transitnownash.org')
      .get('/stops/CHA7AWN/trips.json?per_page=2000')
      .replyWithFile(200, __dirname + '/fixtures/stops-CHA7AWN-trips.json')

  afterEach ->
    nock.cleanAll()
    Date.now = originalDateNow

  context 'regular tests', ->
    beforeEach ->
      Date.now = () ->
        return Date.parse('Fri, 1 Oct 2021 12:00:00 UTC')
      process.env.HUBOT_NEXTBUS_LAT_LON = '36.1650,-86.78404'
      @room = helper.createRoom()

    afterEach ->
      @room.destroy()
      delete process.env.HUBOT_NEXTBUS_LAT_LON

    # hubot nextbus
    it 'returns the next bus for closest stop', (done) ->
      selfRoom = @room
      selfRoom.user.say('alice', '@hubot nextbus')
      setTimeout(() ->
        try
          expect(selfRoom.messages).to.eql [
            ['alice', '@hubot nextbus']
            ['hubot', 'Upcoming Trips for [CHA7AWN] CHARLOTTE AVE & 7TH AVE N WB']
            ['hubot', '   7:01:09   #50 - CHARLOTTE WALMART            in a minute    \n   7:15:49   #17 - GREEN HILLS VIA 12TH AVE S   in 16 minutes  \n   7:16:09   #50 - CHARLOTTE WALMART            in 16 minutes  \n   7:31:09   #50 - CHARLOTTE WALMART            in 31 minutes  \n   7:35:49   #17 - GREEN HILLS VIA 12TH AVE S   in 36 minutes  ']
          ]
          done()
        catch err
          done err
        return
      , 1000)

    # hubot nextbus stop <id>
    it 'returns the next bus for a particular stop', (done) ->
      selfRoom = @room
      selfRoom.user.say('alice', '@hubot nextbus stop CHA7AWN')
      setTimeout(() ->
        try
          expect(selfRoom.messages).to.eql [
            ['alice', '@hubot nextbus stop CHA7AWN']
            ['hubot', 'Upcoming Trips for [CHA7AWN] CHARLOTTE AVE & 7TH AVE N WB']
            ['hubot', '   7:01:09   #50 - CHARLOTTE WALMART            in a minute    \n   7:15:49   #17 - GREEN HILLS VIA 12TH AVE S   in 16 minutes  \n   7:16:09   #50 - CHARLOTTE WALMART            in 16 minutes  \n   7:31:09   #50 - CHARLOTTE WALMART            in 31 minutes  \n   7:35:49   #17 - GREEN HILLS VIA 12TH AVE S   in 36 minutes  ']
          ]
          done()
        catch err
          done err
        return
      , 1000)

    # hubot nextbus stops
    it 'returns the list of nearby stops', (done) ->
      selfRoom = @room
      selfRoom.user.say('alice', '@hubot nextbus stops')
      setTimeout(() ->
        try
          expect(selfRoom.messages).to.eql [
            ['alice', '@hubot nextbus stops']
            ['hubot', 'List of nearby stops:']
            ['hubot', '- [CHA7AWN] CHARLOTTE AVE & 7TH AVE N WB\n- [CHA7AEN] CHARLOTTE AVE & 7TH AVE N EB\n- [6AVDEASN] 6TH AVE & DEADERICK ST SB\n- [6AVDEANN] 6TH AVE N & DEADERICK ST NB\n- [UNI7AWN] UNION ST & 7TH AVE N WB']
          ]
          done()
        catch err
          done err
        return
      , 1000)
