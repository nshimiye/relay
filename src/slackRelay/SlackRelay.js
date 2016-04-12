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
const users = new WeakMap();
const channels = new WeakMap();

class SlackRelay extends Relay {

  constructor(token, debug) {
    super();
    // rtm
    let _rtm = new RtmClient(token, {logLevel: 'none'});
    rtm.set(this, _rtm);
    console.log('rtm connection started!', _rtm._send);

    // you need to wait for the client to fully connect before you can send messages
    _rtm.on(RTM_CLIENT_EVENTS.RTM_CONNECTION_OPENED, function () {
      // This will send the message 'this is a test message' to the channel identified by id 'C0CHZA86Q'
      console.log('connection opened!', arguments);
    });

    _rtm.on(RTM_CLIENT_EVENTS.DISCONNECT, function () {
      // This will send the message 'this is a test message' to the channel identified by id 'C0CHZA86Q'
      console.log('connection closed', arguments);
    });

    _rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
      console.log('Message:', message);
    });

    _rtm.on(RTM_EVENTS.REACTION_ADDED, function handleRtmReactionAdded(reaction) {
      console.log('Reaction added:', reaction);
    });

    _rtm.on(RTM_EVENTS.REACTION_REMOVED, function handleRtmReactionRemoved(reaction) {
      console.log('Reaction removed:', reaction);
    });

    //@TODO how to make this async
    _rtm.start(function() {
      console.log('rtm connection started!', arguments);
    });

    // web
    let _web = new WebClient(token);
    web.set(this, _web);
    // console.log('connection opened!', _web);
    _web.team.info(function teamInfoCb(err, info) {
      if (err) {
        console.log('Error:', err);
      } else if(info) {
        let team = info.team;
        console.log('Team Info:', team.name, team.domain);
      } else {
        // Unknown error
      }
    });
    let slackRelayInstance = this;
    let _users = [];
    users.set(this, _users);
    _web.users.list(function usersInfoCb(err, info) {
      if (err) {
        console.log('Error:', err);
      } else if(info) {
        let members = info.members.map( member => { return { name: member.name, userid: member.id, channelid: undefined}; } );
        console.log('Users Info:', members);
        members.forEach( mb => _users.push(mb) ); // mb : members
        slackRelayInstance.loadDmsAndAddToUsers(_users);
      } else {
        // Unknown error
      }
    });
    let _channels = [];
    channels.set(this, _channels);
    _web.channels.list(function channelsInfoCb(err, info) {
      if (err) {
        console.log('Error:', err);
      } else if(info) {
        let local_channels = info.channels.map( channel => { return { name: channel.name, userid: undefined, channelid: channel.id }; } );
        console.log('Channels Info:', local_channels);
        local_channels.forEach( am => _channels.push(am) ); // am : ambient message
      } else {
        // Unknown error
      }
    });
  }

  /**
   * execute this after user fetch is done
   * @warning this method mutates the input object
   * @return void // @TODO Promise
   */
  loadDmsAndAddToUsers(param_users) {
    let _web = web.get(this);
    let _channels = channels.get(this);
    let slackRelayInstance = this;
    _web.dm.list(function channelsInfoCb(err, info) {
      if (err) {
        console.log('Error:', err);
      } else if(info) {
        let dms = info.ims.map( channel => { return { name: undefined, userid: channel.user, channelid: channel.id }; } );
        console.log('Direct Message Info:', dms);
        dms.forEach(dm => _channels.push(dm) ); // dm : direct message
        //add channelids to the user list
        param_users.forEach(user => { let cid = ( _channels.filter(channel => { return channel.userid === user.userid; })[0] || {} ).channelid; user.channelid = cid; });
        param_users = param_users.filter(user => { return user.channelid; }); // any user object with no channel is not userful
        users.set(slackRelayInstance, param_users);
        console.log('========= START Reachable Users ========');
        console.log(param_users, users.get(slackRelayInstance));
        console.log('========= END   Reachable Users ========');
      } else {
        // Unknown error
      }
    });
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
    console.log('== connect ==', _rtm.slackAPIUrl, _rtm.userAgent, _rtm._token, _rtm.token);
    _rtm.disconnect();

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
   * public
   */
  send(message, user) { // => message = { text: <> } user = { username: <>, userid: <> }
    // rtm.sendMessage('this is a test message', 'C0CHZA86Q', function messageSent() {
    //   // optionally, you can supply a callback to execute once the message has been sent
    // });
    let _rtm = rtm.get(this);
    let _web = web.get(this);
    let text = message.text; // type: String, Ex: 'Hi there!'
    let data = message.data; // type: Object, ex: { attachments: [{title: 'Time in our offices', fields: [{ key: 'New York - USA', value: '' }, { key: 'Kathmandu - Nepal', value: '' }] }] }

    if (data) {
      _web.chat.postMessage(user.channelid || user.userid, text, data, (err, result) => {
        console.log('done', err, result);
      });
    } else if(text) {
      _rtm.sendMessage(text, user.channelid || user.userid, (err, result) => {
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

}

module.exports = SlackRelay;
