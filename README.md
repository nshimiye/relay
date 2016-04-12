# relay
Bot user that can send messages to different users

# Inspiration
Botkit took care of most my use cases
* respond to messages from users
However, when it came to delayed responses, i could not find a way to handle this.
* No easy way to send a "typing ..." notification
* No easy way to send multiple messages with delay in between to a specific user.

# Covered
* Turn the bot on and off.
 * slack RTM api provides a way to do this
* Send message to slack user
 * given username or userid or IM(= slack's channel id for direct messages) id
 * use your bot info (bot id, bot username) to send a message to the above user.
