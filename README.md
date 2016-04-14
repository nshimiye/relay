# relay

Bot user that can send messages to different users

[![Build Status](https://travis-ci.org/nshimiye/relay.svg?branch=master)](https://travis-ci.org/nshimiye/relay)
[![Coverage Status](https://coveralls.io/repos/github/nshimiye/relay/badge.svg?branch=master)](https://coveralls.io/github/nshimiye/relay?branch=master)
[![Code Climate](https://codeclimate.com/github/nshimiye/relay/badges/gpa.svg)](https://codeclimate.com/github/nshimiye/relay)
[![Join the chat at https://gitter.im/nshimiye/relay](https://badges.gitter.im/nshimiye/relay.svg)](https://gitter.im/nshimiye/relay?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

# Installation
```bash
npm install bot-relay
```

# usage
* Instance initialization
```javascript
const relay = require('bot-relay');
let token = '<slack bot token>'; //@TODO add url to get this token
let slackRelay = relay.slackRelay(token);

slackRelay.connect().then( relayInstance => {
  // send messages to known users
  // broadcast messages to all users
  // post messages to channels
}, connectionError => {
  // you can try to reconnect
  // you can verify with slack to make sure your token is still valid
});
```

* Turn the bot on and off.
```javascript
slackRelay.connect(); // return promise - resolve with relay instance
slackRelay.disconnect(); // return promise - resolve with success message
```

* Relay provide a "notify" method that takes in the user-name or channel-name
```javascript
relayInstance.notify('<user-1>', 'user_typing');
```

* Send message to slack user
 * given user name
 * use your bot to send a message to the above user.
```javascript
relayInstance.send('Hi there!', '<user-1>');
```

* Post in a slack channel
 * given a channel name
 * use your bot to post a message to the above channel.
```javascript
relayInstance.post('Hello! I am alive :)', '<channel-1>');
```

* Send message to slack user
```javascript
relayInstance.broadcast('Sorry for spamming!', ['<user-1>', '<user-2>']);
```
