const sendError = (type, client) => {
  switch (type) {
    case 'no_channel':
      return {
        description: 'You are not in a voice channel!',
        color: client.config.color,
      };
    case 'not_bot_channel':
      return {
        description: 'You are not in my voice channel!',
        color: client.config.color,
      };
    case 'no_current_music':
      return {
        description: 'No music is being played',
        color: client.config.errorColor,
      };
    default:
      return {
        description: '',
      };
  }
};

module.exports = { sendError };
