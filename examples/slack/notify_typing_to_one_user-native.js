'use strict';

const config = require('../../config/index').slack;
const token = config.SLACK_API_TOKEN; // for @chatty bot
const imId = config.IM_ID; // for @chatty bot


// from slack module
const RtmClient = require('@slack/client').RtmClient;
const RTM_CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS.RTM;
let _rtm = new RtmClient(token, {logLevel: 'none'});

_rtm.on(RTM_CLIENT_EVENTS.RTM_CONNECTION_OPENED, () => {
  // rtm connection started!
  // use web api to get IM's
  console.log(' rtm connection started! ');
  // let imId = '<im-id>';
  _rtm.sendTyping(imId);
});

_rtm.start();
