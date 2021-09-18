const { GuildMember } = require('discord.js');
const { sendError } = require('../utils/logs');

module.exports = {
  name: 'disconnect',
  description: 'Disconnect the bot from the voice channel.',
  async execute(interaction, player, client) {
    await interaction.deferReply();

    try {
      // disconnect bot
      const { connection: currentConnection } = client.activeConnections.get(interaction.guildId);

      client.activeConnections.set(currentConnection.channel.guildId, {
        connection: currentConnection,
        manualDisconnect: true,
      }); // manual disconnect

      const queue = player.getQueue(interaction.guildId);
      await queue.clear();
      await currentConnection.disconnect();

      return void interaction.followUp({
        embeds: [{ description: 'Successfully left the channel', color: client.config.color }],
      });
    } catch (err) {
      console.error(err);
      return void interaction.followUp({
        embeds: [{ description: `There was an error: ${err}`, color: client.config.errorColor }],
        ephemeral: true,
      });
    }
  },
};
