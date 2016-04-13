'use strict';

/**
 * Stand for a bot user
 * in charge of carrying messages from a locally confugured bot to slack
 */
const Relay = require('../interface/relay');
const RtmClient = require('@slack/client').RtmClient;
const WebClient = require('@slack/client').WebClient;
const RTM_CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS.RTM;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

// how to create private properties
const rtm = new WeakMap();
const web = new WeakMap();
const team = new WeakMap();
const me = new WeakMap();
const users = new WeakMap();
const channels = new WeakMap();
const token_private = new WeakMap();

class SlackRelay extends Relay {

  constructor(token, debug) {
    super();
    token_private.set(this, token);

    // // @TODO query slack db
    // slackWeb = relay.slackWeb(token);

    // rtm
    let _rtm = new RtmClient(token, {logLevel: 'none'});
    rtm.set(this, _rtm);
    console.log('rtm  instance created!', token, debug);

    // web
    let _web = new WebClient(token);
    web.set(this, _web);

    _rtm.on(RTM_CLIENT_EVENTS.DISCONNECT, function () {
      // This will send the message 'this is a test message' to the channel identified by id 'C0CHZA86Q'
      console.log('connection closed', arguments);
    });

    _rtm.on(RTM_EVENTS.REACTION_ADDED, function handleRtmReactionAdded(reaction) {
      console.log('Reaction added:', reaction);
    });

    _rtm.on(RTM_EVENTS.REACTION_REMOVED, function handleRtmReactionRemoved(reaction) {
      console.log('Reaction removed:', reaction);
    });

  }

  get token() {
    return token_private.get(this);
  }
  get users() {
    let _user = users.get(this);
    return _user;
  }
  get channels() {
    let _channels = channels.get(this);
    return _channels;
  }

  connect() {
    let _rtm = rtm.get(this);
    let token = token_private.get(this);
    console.log('== connect ==', _rtm.slackAPIUrl, _rtm.userAgent, _rtm._token);
    let slackRelayInstance = this;
    let promisedResponse = new Promise(function(resolve, reject) {
      // @TODO make sure bot is not already connected
      // if so then just return this instance


      // @TODO setup a listener
      // you need to wait for the client to fully connect before you can send messages
      _rtm.on(RTM_CLIENT_EVENTS.AUTHENTICATED, function (slack) {

        // This will send the message 'this is a test message' to the channel identified by id 'C0CHZA86Q'
        console.log('connection authenticated!', _rtm.connected, slack.url, slack.self.id, slack.self.name);
        // slackRelayInstance.getTeamInfo(token, _rtm);
        let slackData = slackRelayInstance._cleanSlackInfo(slack.team, slack.self, slack.users, slack.channels, slack.ims);
        console.log('connection authenticated!', slackData);

        // add team info to the private variables
        slackRelayInstance._distributeSlackData(slackData);

        // no need to listen to authentication
        let rtm_out = _rtm.removeListener(RTM_CLIENT_EVENTS.AUTHENTICATED);
        console.log('listener removed!', rtm_out.slackAPIUrl);

      });
      //
      _rtm.on(RTM_CLIENT_EVENTS.WS_ERROR, function () {
        // This will send the message 'this is a test message' to the channel identified by id 'C0CHZA86Q'
        console.log('connection failed!', _rtm.connected);
        slackRelayInstance.getTeamInfo(token, _rtm);
        reject({ok: false, message: 'Unknown error while connecting', data: arguments});
      });

      _rtm.on(RTM_CLIENT_EVENTS.RTM_CONNECTION_OPENED, function (slack) {
        console.log('connection opened!', slack);
        // no need to listen to authentication
        let rtm_out = _rtm.removeListener(RTM_CLIENT_EVENTS.RTM_CONNECTION_OPENED);
        resolve(slackRelayInstance);
      });

      // @DONE start the connection
      _rtm.start();
      console.log('connection opened!', _rtm.connected);

    });

    return promisedResponse;
  }
  disconnect() {
    let _rtm = rtm.get(this);
    console.log('== disconnect ==', _rtm.slackAPIUrl, _rtm.userAgent, _rtm._token, _rtm.token);
    _rtm.disconnect();
  }
  configBot(options) { // set the name, the image ... of your bot
    throw new Error('Not implemented');
  }

  /**
   * @public
   * @param { json/string } message
   * @param { json } user
   */
  send(message, name) { // => message = { text: <> } or <>,  user = { username: <>, userid: <> }
    // rtm.sendMessage('this is a test message', 'C0CHZA86Q', function messageSent() {
    //   // optionally, you can supply a callback to execute once the message has been sent
    // });
    let user, found_channel, channelid;
    let _rtm = rtm.get(this);
    let _web = web.get(this);
    let text = (typeof message === 'string')? message : message.text; // type: String, Ex: 'Hi there!'
    let data = message.data; // type: Object, ex: { attachments: [{title: 'Time in our offices', fields: [{ key: 'New York - USA', value: '' }, { key: 'Kathmandu - Nepal', value: '' }] }] }

    // .find function is an es6 function
    user = this.users.find(user_param => { return user_param.name === name; }) || {};
    found_channel = this.channels.find(channel => channel.name === name) || {};
    console.log('Found user = ', user, found_channel);
    // try find user if not then look for named channel

    channelid = user.channelid || found_channel.channelid;
    if (data) {
      _web.chat.postMessage(channelid, text, data, (err, result) => {
        console.log('done', err, result);
      });
    } else if(text) {
      _rtm.sendMessage(text, channelid, (err, result) => {
        console.log('done sending message', err, result);
      });
    } else {
      // @TODO reject saying the some info is missing
    }
    return new Promise((resolve, reject) => { resolve({ok: false, message: 'not sure if message got sent' }); } );
  }

  /**
   * public
   */
  broadcast(message) {

    return new Promise((resolve, reject) => { reject({ok: false, message: 'not implemented yet' }); } );
  }

  /**
   * @public
   * Send a notification to slack user of channel (ex: notify user that you are typing)
   * @param {String} name a user name or channel name
   * @param {String} notification a notification type similar to event type from slack API ( https://api.slack.com/events )
   * @return Promise which resolve with a success object or rejects with an error object
   */
  notify(name, notification) {
    let _rtm, _users, _channels, user, channel, channelid;
    _rtm = rtm.get(this);

    user = this.users.find(user_param => { return user_param.name === name; }) || {};
    channel = this.channels.find(channel_param => channel_param.name === name) || {};

    channelid = user.channelid || channel.channelid;

    _rtm.sendTyping(channelid);

  }

  /**
   * @public
   * @param channel_type
   * @param {Function} handler
   * @return void
   */
  listen(channel_type, handler) {
    let _rtm = rtm.get(this);
    let _users = this.users;
    let _channels = this.channels;
    let _me = me.get(this);
    let self = this;
    _rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
      let bot_id = _me.userid;
      let found_channel = _channels.find(channel => channel.channelid === message.channel) || {},
        found_user = _users.find(user => user.channelid === message.channel) || {};
      // direct_message : message.user = ( _users.find(user => user.channelid === message.channel) || {} ).userid
      let direct_message = message.user === found_user.userid;
      console.log('Message:', bot_id, message, direct_message);
      console.log('Message:', self.message_separation(message.text || '', bot_id));
      let clean_message, parsed_message, user, channel, event;

      if (direct_message) {
        parsed_message = message.text;
        user = found_user.name;
        // @TODO make sure channel is undefined
      } else {
        clean_message = self.message_separation(message.text || '', bot_id);
        parsed_message = clean_message.message;
        event = clean_message.event; // @TODO
        // lookup channel name
        channel = found_channel.name;
        // @TODO make sure user is undefined

      }

      //@TODO run the handler function
      // @TODO right now message object is a string
      handler(self, parsed_message, user, channel);

    });
  }

  /**
   * @private
   * exctract userful information and throw away the rest
   */
  _cleanSlackInfo(team, me, users, channels, ims) {

    let team_clean = { name: team.name, domain: team.domain };

    // console.log('The id of this bot:');
    let me_clean = { name: me.name, userid: me.id, channelid: undefined }; // { name: '@<user>', userid: '<user-id>', channelid: '<channel-id>' };
    // console.log('The id of this bot:', me);

    let all_users = [];
    let members = users.map( member => { return { name: member.name, userid: member.id, channelid: undefined}; } );
    // console.log('Users Info:', members);
    members.forEach( mb => all_users.push(mb) ); // mb : members

    let channels_clean = [];
    let local_channels = channels.map( channel => { return { name: channel.name, userid: undefined, channelid: channel.id }; } );
    // console.log('Channels Info:', local_channels);
    local_channels.forEach( am => channels_clean.push(am) ); // am : ambient message

    let ims_clean = [];
    let dms = ims.map( channel => { return { name: undefined, userid: channel.user, channelid: channel.id }; } );
    // console.log('Direct Message Info:', dms);
    dms.forEach(dm => ims_clean.push(dm) ); // dm : direct message
    //add channelids to the user list
    all_users.forEach(user => { let cid = ( ims_clean.filter(channel => { return channel.userid === user.userid; })[0] || {} ).channelid; user.channelid = cid; });

    //-- START user filtering
    let users_clean = all_users.filter(user => { return user.channelid; }); // any user object with no channel is not userful

    // console.log('========= START Reachable Users ========');
    // console.log(users_clean, all_users);
    // console.log('========= END   Reachable Users ========');
    //-- END user filtering

    return { team_clean, me_clean, users_clean, channels_clean, ims_clean, all_users };
  }

  /**
   * @private
   * helper method to add fetched data to respective holders
   */
  _distributeSlackData(slackData) {
    // add team info to the private variables
    team.set(this, slackData.team_clean);
    me.set(this, slackData.me_clean);
    users.set(this, slackData.users_clean);
    channels.set(this, slackData.channels_clean);
  }

  /***** END   get team users and channels *****/

  // @TODO remove this at the end of implemention
  message_separation(message, bot_id) {
    var event;
    var direct_mention = new RegExp('^\<\@' + bot_id + '\>', 'i');
    var mention = new RegExp('\<\@' + bot_id + '\>', 'i');

    if (message.match(direct_mention)) {
        // this is a direct mention
        message = message.replace(direct_mention, '')
        .replace(/^\s+/, '').replace(/^\:\s+/, '').replace(/^\s+/, '');
        event = 'direct_mention';

        return { message, event };
    } else if (message.match(mention)) {
        event = 'mention';
        return { message, event };
    } else {
        event = 'ambient';
        return { message, event };
    }

  }

}

module.exports = SlackRelay;
