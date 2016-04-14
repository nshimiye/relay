# bot-relay
Bot user that can send messages to different users

# Inspiration
Botkit easily handles responding to messages from users. However, it sometimes fails when responses are delayed.

I could not find an easy way to handle this.
* No easy way to send a "typing ..." notification
* No easy way to send multiple messages with delay in between, to a specific user.

# Thinking
The slogan here is "Simple is Better", this package was built to make it easy to connect external systems to slack.
Slack is a messaging app, so the main thing that the user does on a daily basis is
* Send a message to others
* Reply to messages from other users

Slack achieves this through both RTM and WEB api's, bot-relay will provide a wrapper which handles these two use-cases seamlessly.
i.e. Given a [slack token](), bot-relay will allow u to send and receive messages to slack by providing a user name or channel.

bot-relay use both RTM and WEB api's under the hood.

Example
```javascript
const relay = require('bot-relay');
let slackRelay = relay.slackRelay('<token>');
slackRelay.send('hi there!', 'mars'); // send a message to mars
```

# Covered
* Turn the bot on and off.
 * slack RTM api provides a way to do this by use of a channel-id
```javascript
const RtmClient = require('@slack/client').RtmClient;
const RTM_CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS.RTM;
let _rtm = new RtmClient(token, {logLevel: 'none'});

_rtm.on(RTM_CLIENT_EVENTS.RTM_CONNECTION_OPENED, () => {
  // rtm connection started!
  // use web api to get IM's
  let imId = '<IM-id>'; // IM-id is the id of the user's direct channel
  _rtm.sendTyping(imId);
});

_rtm.start();
```
 * relay provide a "notify" method that takes in the user-name or channel-name
```javascript
const relay = require('bot-relay');
let token = '<slack bot token>'; //@TODO add url to get this token
let slackRelay = relay.slackRelay(token);

slackRelay.connect().then( relayInstance => {
  // notify users that you are about to post/send a message
  // use-case: lookup last deployed version and post it to this channel
  relayInstance.notify('user_typing');
  lookupDeployedVersion('github-repo').then(project => {
    relayInstance.post(`currently deployed version for ${project.name} is ${project.version}`, 'general');
  });

}, connectionError => {
  // you can try to reconnect
  // you can verify with slack to make sure your token is still valid
});
```

* Send message to slack user
 * given user name or IM(= slack's channel id for direct messages) id
 * use your bot info (bot id, bot username) to send a message to the above user.
```javascript
const relay = require('bot-relay');
let token = '<slack bot token>'; //@TODO add url to get this token
let slackRelay = relay.slackRelay(token);

slackRelay.connect().then( relayInstance => {
  // send messages to known users
  relayInstance.send('Hi there!', '<user-1>');
}, connectionError => {
  // you can try to reconnect
  // you can verify with slack to make sure your token is still valid
});
```

* Post in a slack channel
 * given a channel name
 * use your bot info (bot id, bot username) to post a message to the above channel.
```javascript
const relay = require('bot-relay');
let token = '<slack bot token>'; //@TODO add url to get this token
let slackRelay = relay.slackRelay(token);

slackRelay.connect().then( relayInstance => {
  // post message to a channel
  relayInstance.post('Helloo! I am alive :)', '<channel-1>');
}, connectionError => {
  // you can try to reconnect
  // you can verify with slack to make sure your token is still valid
});
```

 * Send message to a subset or all users in the team
  * provide a list of usernames to receive the message
```javascript
 const relay = require('bot-relay');
 let token = '<slack bot token>'; //@TODO add url to get this token
 let slackRelay = relay.slackRelay(token);

 slackRelay.connect().then( relayInstance => {
   // broadcast message to all users
   relayInstance.broadcast('Sorry for spamming!', ['<user-1>', '<user-2>']);

 }, connectionError => {
   // you can try to reconnect
   // you can verify with slack to make sure your token is still valid
 });
```

 * no input is require when sending message to all users
```javascript
const relay = require('bot-relay');
let token = '<slack bot token>'; //@TODO add url to get this token
let slackRelay = relay.slackRelay(token);

slackRelay.connect().then( relayInstance => {
  // broadcast messages to all users
  relayInstance.broadcast('Sorry for spamming!');

}, connectionError => {
  // you can try to reconnect
  // you can verify with slack to make sure your token is still valid
});
```


# Replying to a user's message
* Direct response
This is a response that the bot sends in less than 2 seconds.

Botkit handles this very well.

* Delayed response
Sometimes you may want to run a service that will take more than 2 seconds to complete before you can respond.
Handling this case would require a use of promises or callbacks used to send the response.
Relay uses promise

Steps:
* listen to channels
* if user sends a message to the bot's channel, then the response handler (of type Promise is run)

Notes:
* Once the bot is connected, it should be able to receive messages from other connected users.
* So the developer should provide a "function definition" on how to handle these incoming messages.
* if no handler has been provided, the messages are ignored

```javascript
const relay = require('bot-relay');
let token = '<slack bot token>'; //@TODO add url to get this token
let slackRelay = relay.slackRelay(token);
slackRelay.connect().then( relayInstance => {
  // the reply handler function is given
  // 1. the relay instance that will be used to send response
  // 2. the message received
  // 3. the user name of user who sent the message
  // 4. the channel name if user sent the message through a channel different from his/her private channel with the bot
  let replyHandler = function(relayInstance, message, user, channel) {
    if (channel) {
      relayInstance.post('Sorry for spamming!', channel);
    } else {
      relayInstance.send('Sorry for spamming!', user);
    }
  };

  // @TODO research on why there is a big usage of "on" instead of "listen"
  // relayInstance.on('direct-message', replyHandler);
  relayInstance.listen('direct-message', replyHandler);

}, connectionError => {
  // you can try to reconnect
  // you can verify with slack to make sure your token is still valid
});
```
