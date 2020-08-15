# Measurement Library

Measurement library will provide an open source alternative for sites/apps to send events to Google Analytics.

**This is not an officially supported Google product.**


[![Build Status](https://travis-ci.org/googleinterns/measurement-library.svg?branch=master)](https://travis-ci.org/github/googleinterns/measurement-library/branches)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
![Contributions welcome](https://img.shields.io/badge/contributions-welcome-orange.svg)

## Table of contents
- [Overview](#overview)
- [Installation](#installation)
- [Usage](#usage)
    - [Event Command](#event-command)
    - [Set Command](#set-command)
- [Event Processors](#event-processors)
    - [Google Analytics](#google-analytics)
    - [Custom Event Processor](#custom-event-processor)
- [Storage Interfaces](#storage-interfaces)
    - [Cookies](#cookies)
    - [Custom Storage Interface](#custom-storage-interface)
- [Local Setup](#local-setup)
    - [Creating the build](#creating-the-build)
    - [Running Tests Interactively](#running-tests-interactively)

# Overview
Measurement Library is a utility to help developers send data collected from their website to
other libraries for analytics. After specifying settings in a script tag, you can process any
sent events using a variety of built in event processors (e.g. sending data to Google Analytics).

Data from events or generated by event processors is automatically saved to persist between visits using your choice of
a variety of different storage options (e.g. cookies).

# Installation
First, install the package with your favorite package manager:
```bash
yarn add measurement-library
// or
npm install measurement-library
```

Next, choose [the event processor](#event-processors) and [the storage implementation](#storage-interfaces)
to use and include this code in your `<head>` tag. It should be placed as high up in the block as possible
in order to catch users who leave immediately after loading the page, then immediately leave.
```html
<!-- Measurement Library Snippet -->
<script async src="./node_modules/measurement-library/dist/measure"/>
<script>
  window.dataLayer = window.dataLayer || [];
  function measure(){dataLayer.push(arguments);}
  // One or more config commands. To send data to google analytics while
  // using cookies for storage:
  measure('config', 'googleAnalytics', {
    'measurement_id': YOUR_MEASUREMENT_ID,
    'api_secret': YOUR_API_SECRET,
  }, 'cookies', {});
</script>
```

As an alternative, you can use the development version when testing your page. The dev version has a bigger file size,
but reports possible errors to the console.
```html
<!-- Measurement Library Snippet (Development Version) -->
<script async src="./node_modules/measurement-library/dist/measure-debug"/>
<script>/* Configure script like last example. */ </script>
```

# Usage
After setting up the script tags, you can begin to use the library. All commands
are processed by passing arguments to the  `measure()` function. 

## Event command
When you run the command `measure('event', eventName, eventOptions)`, all registered
[event processors](#event-processors) will read the event and perform actions corresponding
to their API.

## Set command
To save parameters beyond the current page, you can call the command `measure('set', key, value)`.
The registered event processor will determine if the value should be saved, how long the value should
be saved for, and save it. To overwrite this behavior, you can specify a third time-to-live parameter:
`measure('set', key, value, secondsToLive)`. In particular, if `secondsToLive` is 0, no data will be saved
to long term storage.

The set command can also be used to set parameters related to a implementation of
an event processor or storage interface. For example, to modify the default parameters
of the cookies storage, run a `set` command in the script tag before calling
`config`. 

```js
// Set the default cookie parameters
measure('set', 'cookies', {prefix: 'my_', expires: 11});
// Use the default cookie parameters: prefix 'my_' and expires 11.
measure('config', 'eventProcessorName', {}, 'cookies', {});
// Override a default cookie parameter: expires is 22 for this storage.
measure('config', 'eventProcessorName', {}, 'cookies', {expires: 22});
```

# Event Processors
Events are processed with event options arguments. These can

## Google Analytics
To configure the Google Analytics event processor, constructor arguments can be passed in via the [code snippet](#installation).

The supported constructor arguments are:
* api_secret: The Google Analytics API Secret. The API secret can be generated via Google Analytics UI. Required when using the default measurement URL. If included, it will be added as a query parameter.
* measurement_id: The property to be measured's Google Analytics measurement ID. Can be found via Google Analytics UI. Required when using the default measurement URL.
* measurement_url: URL endpoint to send events to. Defaults to Google Analytics collection endpoint. Optional. If overriden, the user will need to ensure the URL forwards events to Google Analytics.
* client_id_expires: Time in seconds to store the client ID in long term storage. Defaults to two years. Optional.
* automatic_params: Array of event parameters that will be searched for in the global data model and pulled into all events if found. Optional.

A basic example:

```js
measure(
  'config',
  'googleAnalytics',
  {
    'measurement_id': YOUR_MEASUREMENT_ID,
    'api_secret': YOUR_API_SECRET,
  },
  'cookies',
  {}
);
```

Events are processed and sent to Google Analytics using the [event command](#event-command).

For a simple page view event with some supporting data, the user could call:

```js
measure('event', 'page_view', {
  'page_title': 'Example Title',
  'page_path': '/example',
});
```

This will send a page_view event to Google Analytics with the event parameters provided. In addition
to the event level parameters provided, the user can set event parameters using the [set command](#set-command) that will
then be included in the event sent to Google Analytics even if not explicitly provided in the event command.

To do this for all Google Analytics event processors, an example would be:

```js
measure('set', 'googleAnalytics', {
  'currency': 'USD',
});
```

All future event calls will now send the currency event parameter with the value USD. This behavior can be overriden
at the event level as more specific parameters take priority. For instance, the following event sets currency
to CAD instead of the previously set USD.

```js
measure('event', 'purchase', {
  'value' 99,
  'currency': 'CAD',
});
```

In addition to this, the global data model can be used to share event parameters. The global data model contains all the
key value pairs stored with the [set command](#set-command) when called without relation to a storage or event processor.

```js
measure('set', 'example_param', 'example_value');
```

If you would like to retrieve and send this parameter with all Google Analytics events after setting it,
you would configure your code snippet to look like the following:

```js
measure(
  'config',
  'googleAnalytics',
  {
    'measurement_id': YOUR_MEASUREMENT_ID,
    'api_secret': YOUR_API_SECRET,
    'automatic_params': ['example_param'],
  },
  'cookies',
  {}
);
```

Client ID is a parameter that is stored globally and included in the automatic parameters list by default. The event
processor generates a new client ID when one is not found in the long term storage and persists this client ID so
that each event can be tied to a specific client. By default the client ID will be generated and stored for two years,
though this can be changed via the client_id_expires constructor argument.

We encourage users to let the event processor generate client IDs instead of providing them themselves. If you wish
to track your users, the userId global key is also a global automatic parameter that users can utilize to track their users.

To do so, just set the user ID:
```js
measure('set', 'userId', 'YOUR_USER_ID');
```

The other automatic parameters that are searched for and can be set globally are: page_path, page_location, and page_title.
Global parameters are considered as being the least specific and will be overriden by parameters of the same name that are set
at the `googleAnalytics` level or sent at event command level.

## Custom Event Processor
If none of the built-in processors fit your needs, you can create your own event processor.
An event processor is a class with the 2 methods described in [eventProcessorInterface.js](/src/eventProcessor/EventProcessorInterface.js)
in addition to a constructor that takes an options object as it's only parameter.

```html
<script async src="./node_modules/measurement-library/dist/measure"/>
<script>
    window.dataLayer = window.dataLayer || [];
    function measure(){dataLayer.push(arguments);}
    class MyProcessor {
      constructor({theNumber});
      processEvent(storageInterface, modelInterface, eventName, eventOptions);
      persistTime(key, value);
    }
    // Call the class constructor  
    measure(config, myProcessor, {theNumber: 42}, 'cookies', {});
    // Calls the processEvent function with parameters 
    // (cookies storage, short term storage, 'jump', {height: 6}).
    measure('event', 'jump', {height: 6})
    // Sets a value in the storage with secondsToLive determined by
    // the persistTime function of the event processor.
    measure('set', 'key', 'value');
</script>
```

# Storage Interfaces
## Cookies
 [//]: # (TODO: pedro)

## Custom Storage Interface
If none of the built-in storage systems fit your needs, you can create your own storage interface.
A storage interface is a class with the 2 methods described in [storageInterface.js](/src/storage/StorageInterface.js)
in addition to a constructor that takes an options object as it's only parameter.

```html
<script async src="./node_modules/measurement-library/dist/measure"/>
<script>
    window.dataLayer = window.dataLayer || [];
    function measure(){dataLayer.push(arguments);}
    class MyStorage {
      constructor({theNumber});
      save(key, value, secondsToLive= 3600*24) {};
      load(key, defaultValue= undefined) {};
    }
    // Call the class constructor.
    measure(config, 'eventProcessorName', {}, MyStorage, {theNumber: 42});
    // Call the save command with secondsToLive determined by the persistTime
    // function of the event processor.
    measure('set', 'key', 'value');
</script>
```

# Local Setup
## Creating The Build
You will need to have either [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
or [yarn](https://classic.yarnpkg.com/en/docs/install/#debian-stable) installed.

First, install dependencies with yarn or npm
```shell script
yarn install
# or
npm install
```

Next, run the tests using yarn or npm:

```shell script
yarn test
# or
npm run test
```

## Running Tests Interactively
You can also run the tests "interactively" via Karma directly.

```shell script
yarn unit
# or
npm run unit
```

To run the integration tests instead of the unit tests,

```shell script
yarn integration
# or
npm run integration
```
****