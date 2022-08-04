# Description:
#   Get the next bus for a particular stop
#
# Configuration:
#   HUBOT_NEXTBUS_BASE_URL - URL of a `gtfs-rails-api` instance
#   HUBOT_NEXTBUS_LAT_LON - Default location for `hubot nextbus`
#
# Commands:
#   hubot nextbus
#   hubot nextbus stops
#   hubot nextbus stop <stop-identifier>

#
# Author:
#   stephenyeargin

moment = require('moment-timezone')
AsciiTable = require('ascii-table')
baseURL = process.env.HUBOT_NEXTBUS_BASE_URL || 'https://gtfs.transitnownash.org'
latlon = process.env.HUBOT_NEXTBUS_LAT_LON

module.exports = (robot) ->
  # query the default location's closest bus stop
  robot.respond /(?:bus|nextbus)(?: me)?$/i, (msg) ->
    getAPIResponse "stops/near/#{latlon}/1000.json?per_page=5", msg, (stops) ->
      if stops.total > 0
        queryStopById stops.data[0].stop_gid, msg
      else
        msg.send "No stops found near #{latlon}"

  # get a list of nearby stops
  robot.respond /(?:bus|nextbus) stops$/i, (msg) ->
    getAPIResponse "stops/near/#{latlon}/1000.json?per_page=5", msg, (stops) ->
      msg.send "List of nearby stops:"
      output = []
      for stop in stops.data
        output.push "- [#{stop.stop_gid}] #{stop.stop_name}"
      msg.send output.join("\n")

  # get a particular stop's next bus
  robot.respond /(?:bus|nextbus) stop ([A-Z0-9_]+)$/i, (msg) ->
    stop_id = msg.match[1]
    robot.logger.debug stop_id
    queryStopById stop_id, msg

  queryStopById = (stop_id, msg) ->
    getAPIResponse 'agencies.json', msg, (agencies) ->
      # Override timezone for moment() calls
      process.env.TZ = agencies.data[0].agency_timezone
      robot.logger.debug process.env.TZ

      getAPIResponse "stops/#{stop_id}/trips.json?per_page=2000", msg, (trips) ->
        nextTrips = trips.data.filter((i) => moment(moment().toISOString().split('T')[0] + ' ' + i.stop_times[0].arrival_time.trim().padStart(8, '0')).isAfter(moment(), 'second'))
        robot.logger.debug nextTrips
        if nextTrips.length == 0
          return msg.send "The last bus has already run for today."

        table = new AsciiTable()
        stop = nextTrips[0].stop_times[0].stop
        msg.send "Upcoming Trips for [#{stop.stop_gid}] #{stop.stop_name}"
        for trip in nextTrips.slice(0, 5)
          time = moment(moment().toISOString().split('T')[0] + ' ' + trip.stop_times[0].arrival_time.trim().padStart(8, '0'));
          table.addRow [trip.stop_times[0].arrival_time, "##{trip.route_gid} - #{trip.trip_headsign}", time.fromNow()]
        table.removeBorder()
        msg.send table.toString()

  getAPIResponse = (path, msg, cb) ->
    url = "#{baseURL}/#{path}"
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
