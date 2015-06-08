chai = require 'chai'
sinon = require 'sinon'
chai.use require 'sinon-chai'

expect = chai.expect

describe 'hubot-nextbus', ->
  beforeEach ->
    @robot =
      respond: sinon.spy()
      hear: sinon.spy()

    require('../src/hubot-nextbus')(@robot)

  it 'registers a general listener', ->
    expect(@robot.respond).to.have.been.calledWith(/(?:bus|nextbus)(?: me)?$/i)

  it 'registers a stop respond listener', ->
    expect(@robot.respond).to.have.been.calledWith(/(?:bus|nextbus) stop ([A-Z0-9]+)$/i)

  it 'registers a stops respond listener', ->
    expect(@robot.respond).to.have.been.calledWith(/(?:bus|nextbus) stops$/i)
