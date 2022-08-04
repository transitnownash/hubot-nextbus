# Hubot Nextbus (Nashville)

[![npm version](https://badge.fury.io/js/hubot-nextbus.svg)](http://badge.fury.io/js/hubot-nextbus) [![Node CI](https://github.com/stephenyeargin/hubot-nextbus/actions/workflows/nodejs.yml/badge.svg)](https://github.com/stephenyeargin/hubot-nextbus/actions/workflows/nodejs.yml)

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
| `HUBOT_NEXTBUS_LAT_LON` | No       |Default location for `hubot nextbus`, separated by a comma. (e.g. `36.1629191,-86.7813481`)|

## Usage

### `hubot nextbus`

Returns the next bus for the nearest stop.

```
user> hubot nextbus
hubot> Next bus arrives to 5TH AVE N & THE ARCADE NB at 9:45:38 pm (#61 - GULCH - GREEN CIRCUIT)
```

### `hubot nextbus stops`

Get the list of stops nearby your configured latitude and longitude.

```
user> hubot nextbus stops
hubot> List of nearby stops:
hubot> - 6AVCHUSN - 6TH AVE N & CHURCH ST SB / (Served by: #3 - WHITE BRIDGE, [...])
hubot> - 5AUNISM - 5TH AVE & THE ARCADE SB / (Served by: #1 - 100 OAKS MALL)
hubot> - 5AVCHUNM - 5TH AVE N & THE ARCADE NB / (Served by: #1 - DOWNTOWN, [...])
hubot> - 5AVCHUNN - 5TH AVE N & CHURCH ST NB / (Served by: #1 - DOWNTOWN, [...])
hubot> - UNI6AWN - UNION ST & 6TH AVE N WB / (Served by: #33 - DOWNTOWN, [...])
```

### `hubot nextbus stop <stop id>`

Returns the next bus for a given stop ID.

```
user> hubot nextbus stop 5AVCHUNM
hubot> Next bus arrives to 5TH AVE N & THE ARCADE NB at 9:45:38 pm (#61 - GULCH - GREEN CIRCUIT)
```
