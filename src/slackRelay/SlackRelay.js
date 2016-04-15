'use strict';

/**
 * Stand for a bot user
 * in charge of carrying messages from a locally confugured bot to slack
 * @author Marcellin<nmarcellin2@gmail.com>
 */
 const events = require('events');

const RtmClient = require('@slack/client').RtmClient;
const WebClient = require('@slack/client').WebClient;
const RTM_CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS.RTM;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

const Relay = require('../interface/relay');

// how to create private properties
const rtm = new WeakMap();
const web = new WeakMap();
const team = new WeakMap();
const me = new WeakMap();
const users = new WeakMap();
const channels = new WeakMap();
const token_private = new WeakMap();
const event_emitter = new WeakMap();

class SlackRelay extends Relay {

  constructor(token, debug) {
    super();
    token_private.set(this, token);

    // rtm
    let _rtm = new RtmClient(token, {logLevel: 'none'});
    rtm.set(this, _rtm);
    console.log('rtm  instance created!', token, debug);

    // it makes sense to start listening after the instance initialization because
    // this ensures us that only on listener is created
    this._intializeSlackListener();

    // web
    // no need to create a class for managing web api, because we won't really be using it that much
    // 1. it is used to send attachments
    let _web = new WebClient(token);
    web.set(this, _web);

    // event
    let _event_emitter = new events.EventEmitter();
    event_emitter.set(this, _event_emitter);
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
    let connectionTimeout;
    let _rtm = rtm.get(this);
    let token = token_private.get(this);
    let slackRelayInstance = this;
    console.log('== connect ==', _rtm.slackAPIUrl, _rtm.userAgent, _rtm._token);
    let promisedResponse = new Promise(function(resolve, reject) {
      // @DONE make sure bot is not already connected
      // if so then just return this instance
      if (_rtm.connected) {
        resolve(slackRelayInstance);
      } else {

        // @DONE setup a listener
        // you need to wait for the client to fully connect before you can send messages
        _rtm.on(RTM_CLIENT_EVENTS.AUTHENTICATED, slack => {

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

        // 1. runs if the token used is invalid
        _rtm.on(RTM_CLIENT_EVENTS.DISCONNECT, (message, cause) => {
          console.log('RTM_CLIENT_EVENTS.DISCONNECT', _rtm.connected, message, cause);

          let rtm_out = _rtm.removeListener(RTM_CLIENT_EVENTS.DISCONNECT);
          clearTimeout(connectionTimeout);
          reject({ok: false, message, data: cause});
        });
        _rtm.on(RTM_CLIENT_EVENTS.WS_ERROR, () => {
          // This will send the message 'this is a test message' to the channel identified by id 'C0CHZA86Q'
          console.log('RTM_CLIENT_EVENTS.WS_ERROR', _rtm.connected, arguments);
          slackRelayInstance.getTeamInfo(token, _rtm);
          clearTimeout(connectionTimeout);
          reject({ok: false, message: 'Unknown error while connecting', data: arguments});
        });

        _rtm.on(RTM_CLIENT_EVENTS.RTM_CONNECTION_OPENED, () => {
          console.log('connection opened!');
          // no need to listen to authentication
          let rtm_out = _rtm.removeListener(RTM_CLIENT_EVENTS.RTM_CONNECTION_OPENED);

          clearTimeout(connectionTimeout);
          resolve(slackRelayInstance);
        });

        // @DONE start the connection
        _rtm.start();
        console.log('connection opened!', _rtm.connected);
        connectionTimeout = setTimeout( () => {
          reject({ok: false, message: 'It is taking too long to connect to slack', data: null});
        }, 5000);

      }

    });

    return promisedResponse;
  }

  /**
   * @public
   * @TODO decide whether this method returns a promise
   */
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
    let self = this;
    return new Promise((resolve, reject) => {

      // rtm.sendMessage('this is a test message', 'C0CHZA86Q', function messageSent() {
      //   // optionally, you can supply a callback to execute once the message has been sent
      // });
      let user, channelid;
      // type: String, Ex: 'Hi there!'
      let text = (typeof message === 'object')? message.text : message;
      // type: Object, ex: { attachments: [{title: 'Time in our offices', fields: [{ key: 'New York - USA', value: '' }, { key: 'Kathmandu - Nepal', value: '' }] }] }
      let data = message.data;

      // .find function is an es6 function
      user = self.users.find(user_param => { return user_param.name === name; }) || {};
      console.log('Found user = ', user);
      // try find user if not then look for named channel

      channelid = user.channelid;
      this._genericSend(text, data, channelid).then(success_object => {
        resolve(success_object);
      }, error_object => {
        reject(error_object);
      }).catch(e => {
        let ok = false,
          data = e,
          message = 'unknown error found';
        reject({ ok, message, data });
      });

      resolve({ok: false, message: 'not sure if message got sent' });

    });
  }

  /**
   * @public
   * post a message to slack channel
   * @param { json/string } message
   * @param { json } user
   */
  post(message, channel_name) {
    // => message = { text: <> } or <>,  user = { username: <>, userid: <> }
    let self = this;
    return new Promise((resolve, reject) => {

      let found_channel, channelid;
      // type: String, Ex: 'Hi there!'
      let text = (typeof message === 'string')? message : message.text;
      // type: Object, ex: { attachments: [{title: 'Time in our offices', fields: [{ key: 'New York - USA', value: '' }, { key: 'Kathmandu - Nepal', value: '' }] }] }
      let data = message.data;

      // .find function is an es6 function
      found_channel = self.channels.find(channel => channel.name === channel_name) || {};
      console.log('Found channel = ',found_channel);
      // try find user if not then look for named channel

      channelid = found_channel.channelid;
      this._genericSend(text, data, channelid).then(success_object => {
        resolve(success_object);
      }, error_object => {
        reject(error_object);
      }).catch(e => {
        let ok = false,
          data = e,
          message = 'unknown error found';
        reject({ ok, message, data });
      });

    });
  }

  /**
   * @private
   * send messages on behalf of "send" or "post" method
   * @param {String} text
   * @param {} data
   * @param {String} channelid
   * @return {Promise} just to make sure we can easily catch unknown errors
   */
  _genericSend(text, data, channelid) {
    let _rtm = rtm.get(this);
    let _web = web.get(this);
    return new Promise((resolve, reject) => {

      if (data) {
        _web.chat.postMessage(channelid, text, data, (err, result) => {
          console.log('done', err, result);
        });
      } else if(text) {
        _rtm.sendMessage(text, channelid, (err, result) => {
          console.log('done sending message', err, result);
        });
      } else {
        // @DONE reject saying the some info is missing => this will run if both text and data params are undefined
        reject({ok: false, message: 'no message to send', data: null });
      }

      resolve({ok: true, message: 'not sure if message got sent' });

    });
  }

  /**
   * @public
   */
  broadcast(message) {

    return new Promise((resolve, reject) => { reject({ok: false, message: 'not implemented yet' }); });
  }

  /**
   * @public
   * Send a notification to slack user of channel (ex: notify user that you are typing)
   * @param {String} name a user name or channel name
   * @param {String} notification a notification type similar to event type from slack API ( https://api.slack.com/events )
   * @return {Promise} which resolve with a success object or rejects with an error object
   */
  notify(name, notification) {
    let _rtm, _users, _channels, user, channel, channelid;
    _rtm = rtm.get(this);

    user = this.users.find(user_param => { return user_param.name === name; }) || {};
    channel = this.channels.find(channel_param => channel_param.name === name) || {};

    channelid = user.channelid || channel.channelid;

    // only one notification type is supported 'user_typing'
    _rtm.sendTyping(channelid);

  }

  /**
   * @public
   * @param {String or Array} message_type ex: direct_message, direct_mention, mention, ambient
   * @param {Function} handler function to run once the message is received
   * @return {Promise} just to make sure we can easily catch unknown errors
   */
  listen(message_type, handler) {
    // let _rtm = rtm.get(this);
    // let _me = me.get(this);
    // let _handlerHolder = handler_holder.get(this);
    let _event_emitter = event_emitter.get(this);
    // let _users = this.users;
    // let _channels = this.channels;
    // let self = this;
    return new Promise((resolve, reject) => {

      if (typeof handler !== 'function') {
        reject({ok: false, message: 'the handler must be a function' });
      }

      // add it to the list of events to listen to
      if (typeof message_type === 'string') { // input is a string
        _event_emitter.on(message_type, handler);
      } else if ( message_type && message_type.length) { // input is non-empty array
        message_type.forEach(mt => {
          _event_emitter.on(mt, handler);
        });
      } else {
        // tell user about supported message types
        let ok = false;
        let message = 'supported types are direct_message, direct_mention, mention, and ambient';
        let data = message_type;
        reject({ok, message, data });
      }

      resolve({ok: true, message: 'A message listener has just been turned on!', data: handler});

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

  /**
   * @private
   * call the rtm.on function on
   */
  _intializeSlackListener() {
    let _rtm = rtm.get(this);

    let self = this;
    _rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
      let _me = me.get(self);
      let _event_emitter = event_emitter.get(self);
      let _users = self.users;
      let _channels = self.channels;

      let bot_id = _me.userid;
      let found_channel = _channels.find(channel_param => channel_param.channelid === message.channel) || {},
        found_user = _users.find(user_param => user_param.channelid === message.channel) || {};
      // direct_message : message.user = ( _users.find(user => user.channelid === message.channel) || {} ).userid
      let direct_message = message.user === found_user.userid;
      console.log('Message:', bot_id, message, direct_message);
      let clean_message, parsed_message, user, channel, event;
      event = 'direct_message';

      if (direct_message) {
        parsed_message = message.text;
        user = found_user.name;
        // @DONE make channel is undefined => it is not set to anything from it creation to this point
      } else {
        clean_message = self.message_separation(message.text || '', bot_id);
        parsed_message = clean_message.message;
        event = clean_message.event; // @DONE respond to messages depending on the event type, right now the channel_type is being ignored
        // lookup channel name
        channel = found_channel.name;
        // when posting message to chanel it is a good idea to tell the receiver about who posted
        user = found_user.name;
      }

      // @DONE run the handler function
      // @DONE right now message object is a string
      console.log('event type: ', event);

      _event_emitter.emit(event, self, parsed_message, user, channel);

    });
  }

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
