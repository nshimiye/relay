# relay
Bot user that can send messages to different users

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
 * given user name or IM(= slack's channel id for direct messages) id
 * use your bot info (bot id, bot username) to send a message to the above user.
```javascript
relayInstance.send('Hi there!', '<user-1>');
```

* Post in a slack channel
 * given a channel name
 * use your bot info (bot id, bot username) to post a message to the above channel.
```javascript
relayInstance.post('Hello! I am alive :)', '<channel-1>');
```

* Send message to slack user
```javascript
relayInstance.broadcast('Sorry for spamming!', ['<user-1>', '<user-2>']);
```
