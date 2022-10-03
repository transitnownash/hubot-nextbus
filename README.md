# Hubot Nextbus (Nashville)

[![npm version](https://badge.fury.io/js/hubot-nextbus.svg)](http://badge.fury.io/js/hubot-nextbus) [![Node CI](https://github.com/transitnownash/hubot-nextbus/actions/workflows/nodejs.yml/badge.svg)](https://github.com/transitnownash/hubot-nextbus/actions/workflows/nodejs.yml)

This Hubot package works with . You provide an API key and a latitude and longitude for it to obtain the next expect bus to a particular set of nearby stops.

## Installation

In your hubot repository, run:

`npm install hubot-nextbus --save`

Then add **hubot-nextbus** to your `external-scripts.json`:

```json
["hubot-nextbus"]
```

### Configuration

| Environment Variable    | Optional | Description                             |
| ----------------------- | :------: | ----------------------------------------|
| `HUBOT_NEXTBUS_LAT_LON` | No       | Default location for `hubot nextbus`, separated by a comma. (e.g. `36.1629191,-86.7813481`)|
| `HUBOT_NEXTBUS_STOP_ID` | Yes       | Specific identifier to use with `hubot nextbus`; if not set, falls back to latitude/longitude |
| `HUBOT_NEXTBUS_BASE_URL`| Yes      | URL of a `gtfs-rails-api` instance; Defaults to Nashville, TN. |

## Usage

### `hubot nextbus`

Returns the next bus for the nearest stop.

```
user> hubot nextbus
hubot> Upcoming Trips for [CHA7AWN] CHARLOTTE AVE & 7TH AVE N WB
  7:01 AM   #50 - CHARLOTTE WALMART            in a minute    
  7:15 AM   #17 - GREEN HILLS VIA 12TH AVE S   in 16 minutes  
  7:16 AM   #50 - CHARLOTTE WALMART            in 16 minutes  
  7:31 AM   #50 - CHARLOTTE WALMART            in 31 minutes  
  7:35 AM   #17 - GREEN HILLS VIA 12TH AVE S   in 36 minutes  
```

### `hubot nextbus stops`

Get the list of stops nearby your configured latitude and longitude.

```
user> hubot nextbus stops
hubot> List of nearby stops:
hubot> - [CHA7AWN] CHARLOTTE AVE & 7TH AVE N WB
- [CHA7AEN] CHARLOTTE AVE & 7TH AVE N EB
- [6AVDEASN] 6TH AVE & DEADERICK ST SB
- [6AVDEANN] 6TH AVE N & DEADERICK ST NB
- [UNI7AWN] UNION ST & 7TH AVE N WB
```

### `hubot nextbus stop <stop id>`

Returns the next bus for a given stop ID.

```
user> hubot nextbus stop PORGRENN
hubot> Upcoming Trips for [PORGRENN] PORTER RD & GREENWOOD AVE NB
  10:34 PM   #4 - INGLEWOOD   in 25 minutes  
  11:34 PM   #4 - INGLEWOOD   in an hour     
  12:32 AM   #4 - INGLEWOOD   in 2 hours 
```
