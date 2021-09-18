const { GuildMember } = require('discord.js');
const { sendError } = require('../utils/logs');

module.exports = {
  name: 'pause',
  description: 'Pause current song!',
  async execute(interaction, player, client) {
    if (!(interaction.member instanceof GuildMember) || !interaction.member.voice.channel) {
      return void interaction.reply({
        content: 'You are not in a voice channel!',
        ephemeral: true,
      });
    }

    if (
      interaction.guild.me.voice.channelId &&
      interaction.member.voice.channelId !== interaction.guild.me.voice.channelId
    ) {
      return void interaction.reply({
        content: 'You are not in my voice channel!',
        ephemeral: true,
      });
    }

    await interaction.deferReply();
    const queue = player.getQueue(interaction.guildId);
    if (!queue || !queue.playing)
      return void interaction.followUp({
        embeds: [sendError('no_current_music', client)],
      });
    const success = queue.setPaused(true);
    return void interaction.followUp({
      embeds: [
        {
          description: success ? '⏸ | Paused!' : '❌ | Something went wrong!',
          color: client.config.color,
        },
      ],
    });
  },
};
