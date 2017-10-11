Helper = require('hubot-test-helper')
chai = require 'chai'
nock = require 'nock'

expect = chai.expect

helper = new Helper('../src/nextbus.coffee')

describe 'hubot-nextbus', ->
  beforeEach ->
    nock.disableNetConnect()

    nock('https://nextbus.jt2k.com')
      .get('/api/findstop/0,0?key=foobarbaz')
      .replyWithFile(200, __dirname + '/fixtures/findstop.json')
    nock('https://nextbus.jt2k.com')
      .get(/\/api\/stop\/(.*)\?key=foobarbaz$/)
      .replyWithFile(200, __dirname + '/fixtures/stop.json')

  afterEach ->
    nock.cleanAll()

  context 'regular tests', ->
    beforeEach ->
      process.env.HUBOT_NEXTBUS_API_KEY = 'foobarbaz'
      process.env.HUBOT_NEXTBUS_LAT_LON = '0,0'
      @room = helper.createRoom()

    afterEach ->
      @room.destroy()
      delete process.env.HUBOT_NEXTBUS_API_KEY
      delete process.env.HUBOT_NEXTBUS_LAT_LON

    # hubot nextbus
    it 'returns the next bus for closest stop', (done) ->
      selfRoom = @room
      selfRoom.user.say('alice', '@hubot nextbus')
      setTimeout(() ->
        try
          expect(selfRoom.messages).to.eql [
            ['alice', '@hubot nextbus']
            ['hubot', 'Next outbound bus arrives to 6TH AVE N & CHURCH ST SB at 3:38:08 pm (#3 - WEST END - WHITE BRIDGE)']
          ]
          done()
        catch err
          done err
        return
      , 1000)

    # hubot nextbus stop <id>
    it 'returns the next bus for a particular stop', (done) ->
      selfRoom = @room
      selfRoom.user.say('alice', '@hubot nextbus stop 6AVCHUSN')
      setTimeout(() ->
        try
          expect(selfRoom.messages).to.eql [
            ['alice', '@hubot nextbus stop 6AVCHUSN']
            ['hubot', 'Next outbound bus arrives to 6TH AVE N & CHURCH ST SB at 3:38:08 pm (#3 - WEST END - WHITE BRIDGE)']
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
            ['hubot', '- 6AVCHUSN - 6TH AVE N & CHURCH ST SB / (Served by: #3 - WHITE BRIDGE, #5 - BELLEVUE, #7 - GREEN HILLS, #38 - ANTIOCH)']
            ['hubot', '- 7AVCHUSN - 7TH AVE N & CHURCH ST SB / (Served by: #1 - 100 OAKS MALL, #8 - 8TH AVE, LIPSCOMB)']
            ['hubot', '- 6AVCOMSN - 6TH AVE N & COMMERCE ST SB / (Served by: #3 - WHITE BRIDGE, #5 - BELLEVUE, #7 - GREEN HILLS)']
            ['hubot', '- 5AVCHUNN - 5TH AVE N & CHURCH ST NB / (Served by: #60 - BICENTENNIAL MALL,TSU, #61 - BICENTENNIAL MALL)']
            ['hubot', '- UNI6AWN - UNION ST & 6TH AVE N WB / (Served by: #33 - DOWNTOWN, #37 - DOWNTOWN, #37 - MCMURRAY)']
          ]
          done()
        catch err
          done err
        return
      , 1000)
