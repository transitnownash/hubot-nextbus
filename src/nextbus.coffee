# Description:
#   Get the next bus for a particular stop in Nashville
#
# Dependencies:
#   None
#
# Configuration:
#   HUBOT_NEXTBUS_API_KEY - Key provided by API
#   HUBOT_NEXTBUS_LAT_LON - Default location for `hubot nextbus`
#
# Commands:
#   hubot nextbus
#   hubot nextbus stops
#   hubot nextbus stop <stop-identifier>

#
# Author:
#   stephenyeargin

api_key = process.env.HUBOT_NEXTBUS_API_KEY
latlon = process.env.HUBOT_NEXTBUS_LAT_LON

module.exports = (robot) ->

  # query the default location's closest bus stop
  robot.respond /(?:bus|nextbus)(?: me)?$/i, (msg) ->
    getAPIResponse "findstop/#{latlon}", msg, (stops) ->
      if stops
        queryStopById stops[0].stop_id, msg
      else
        msg.send "No stops found near #{latlon}"

  # get a list of nearby stops
  robot.respond /(?:bus|nextbus) stops$/i, (msg) ->
    getAPIResponse "findstop/#{latlon}", msg, (stops) ->
      msg.send "List of nearby stops:"
      for stop in stops
        route_list = ("##{direction.route_id} - #{direction.trip_headsign}" for direction in stop.directions)
        msg.send "- #{stop.stop_id} - #{stop.stop_name} / (Served by: #{route_list.join(', ')})"

  # get a particular stop's next bus
  robot.respond /(?:bus|nextbus) stop ([A-Z0-9_]+)$/i, (msg) ->
    stop_id = msg.match[1]
    robot.logger.debug stop_id
    queryStopById stop_id, msg

  queryStopById = (stop_id, msg) ->
    getAPIResponse "stop/#{stop_id}", msg, (stop)->
      robot.logger.debug stop
      if !stop.next
        return msg.send "The last bus has already run for today."
      direction = if stop.next.direction_id == '0' then 'outbound' else 'inbound'
      msg.send "Next #{direction} bus arrives to #{stop.stop_name} at #{stop.next.arrival_time_str} (##{stop.next.route_id} - #{stop.next.route_long_name})"

  getAPIResponse = (method, msg, cb) ->
    url = "https://nextbus.jt2k.com/api/#{method}?key=#{api_key}"
    robot.logger.debug url
    robot.http(url)
      .get() (err, res, body) ->
        response = JSON.parse(body)
        if err
          return msg.send err
        if response.error
          return msg.send response.error
        if !body
          return msg.send "No data returned."
        cb(response)
