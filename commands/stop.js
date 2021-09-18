const { GuildMember } = require('discord.js');
const { sendError } = require('../utils/logs');

module.exports = {
  name: 'stop',
  description: 'Stop all songs in the queue!',
  async execute(interaction, player, client) {
    if (!(interaction.member instanceof GuildMember) || !interaction.member.voice.channel) {
      return void interaction.reply({
        embeds: [sendError('no_channel', client)],
        ephemeral: true,
      });
    }

    if (
      interaction.guild.me.voice.channelId &&
      interaction.member.voice.channelId !== interaction.guild.me.voice.channelId
    ) {
      return void interaction.reply({
        embeds: [sendError('not_bot_channel', client)],
        ephemeral: true,
      });
    }

    await interaction.deferReply();
    const queue = player.getQueue(interaction.guildId);
    if (!queue || !queue.playing)
      return void interaction.followUp({
        embeds: [sendError('no_current_music', client)],
      });
    queue.destroy();
    return void interaction.followUp({
      embeds: [
        {
          description: '🛑 | Stopped the player!',
          color: client.config.color,
        },
      ],
    });
  },
};
