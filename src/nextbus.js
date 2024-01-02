// Description:
//   Get the next bus for a particular stop
//
// Configuration:
//   HUBOT_NEXTBUS_BASE_URL - URL of a `gtfs-rails-api` instance
//   HUBOT_NEXTBUS_LAT_LON - Default location for stop search
//   HUBOT_NEXTBUS_STOP_ID - Default stop for `hubot nextbus`
//
// Commands:
//   hubot nextbus
//   hubot nextbus stops
//   hubot nextbus stop <stop-identifier>
//
// Author:
//   stephenyeargin

const moment = require('moment');
const AsciiTable = require('ascii-table');

module.exports = (robot) => {
  const baseURL = process.env.HUBOT_NEXTBUS_BASE_URL || 'https://gtfs.transitnownash.org';
  const latlon = process.env.HUBOT_NEXTBUS_LAT_LON;
  const defaultStopId = process.env.HUBOT_NEXTBUS_STOP_ID;

  const getAPIResponse = (path, msg, cb) => {
    const url = `${baseURL}/${path}`;
    robot.logger.debug(url);
    robot.http(url)
      .get()((err, res, body) => {
        const response = JSON.parse(body);
        if (err) {
          msg.send(err);
          return;
        }
        if (response.error) {
          msg.send(response.error);
          return;
        }
        if (!body) {
          msg.send('No data returned.');
          return;
        }
        cb(response);
      });
  };

  const formatTripTimeAsMoment = (timeStr) => {
    if (/^2[4-9]:/.test(timeStr)) {
      // eslint-disable-next-line no-param-reassign
      timeStr = (parseInt(timeStr.substr(0, 2), 10) - 24) + timeStr.substr(2, 8);
      return moment(`${moment().format('YYYY-MM-DD')} ${timeStr.padStart(8, '0')}`).add(1, 'days');
    }
    return moment(`${moment().format('YYYY-MM-DD')} ${timeStr.trim().padStart(8, '0')}`);
  };

  const queryStopById = (stopId, msg) => getAPIResponse('agencies.json', msg, (agencies) => {
    // Override timezone for moment() calls
    process.env.TZ = agencies.data[0].agency_timezone;
    robot.logger.debug(process.env.TZ);
    robot.logger.debug('Current Time:', moment());
    getAPIResponse(`stops/${stopId}/trips.json?per_page=2000`, msg, (trips) => {
      const nextTrips = trips.data.filter((trip) => {
        const tripTime = formatTripTimeAsMoment(trip.stop_times[0].arrival_time);
        return tripTime.isAfter(moment(), 'second');
      });
      robot.logger.debug(nextTrips);
      if (nextTrips.length === 0) {
        msg.send('The last bus has already run for today.');
        return;
      }

      const table = new AsciiTable();
      const {
        stop,
      } = nextTrips[0].stop_times[0];
      msg.send(`Upcoming Trips for [${stop.stop_gid}] ${stop.stop_name}`);
      nextTrips.slice(0, 5).forEach((trip) => {
        const tripTime = formatTripTimeAsMoment(trip.stop_times[0].arrival_time);
        table.addRow([formatTripTimeAsMoment(trip.stop_times[0].arrival_time).format('LT'), `#${trip.route_gid} - ${trip.trip_headsign}`, tripTime.fromNow()]);
      });
      table.removeBorder();
      msg.send(table.toString());
    });
  });

  // query the default stop ID or location's closest bus stop
  robot.respond(/(?:bus|nextbus)(?: me)?$/i, (msg) => {
    if (defaultStopId) {
      queryStopById(defaultStopId, msg);
      return;
    }

    getAPIResponse(`stops/near/${latlon}/1000.json?per_page=5`, msg, (stops) => {
      if (stops.total > 0) {
        queryStopById(stops.data[0].stop_gid, msg);
        return;
      }
      msg.send(`No stops found near ${latlon}`);
    });
  });

  // get a list of nearby stops
  robot.respond(/(?:bus|nextbus) stops$/i, (msg) => getAPIResponse(`stops/near/${latlon}/1000.json?per_page=5`, msg, (stops) => {
    msg.send('List of nearby stops:');
    const output = [];
    stops.data.forEach((stop) => {
      output.push(`- [${stop.stop_gid}] ${stop.stop_name}`);
    });
    msg.send(output.join('\n'));
  }));

  // get a particular stop's next bus
  robot.respond(/(?:bus|nextbus) stop ([A-Z0-9_]+)$/i, (msg) => {
    const stopId = msg.match[1];
    robot.logger.debug(stopId);
    queryStopById(stopId, msg);
  });
};
