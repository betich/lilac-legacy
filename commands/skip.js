const { GuildMember } = require('discord.js');
const { sendError } = require('../utils/logs');

module.exports = {
  name: 'skip',
  description: 'Skip a song!',
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
    if (!queue || !queue.playing) return void interaction.followUp({ embeds: [sendError('no_current_music', client)] });
    const currentTrack = queue.current;
    const success = queue.skip();
    return void interaction.followUp({
      embeds: [
        {
          description: success ? `Skipped to the next song 😊` : 'Something went wrong',
          color: success ? client.config.color : client.config.errorColor,
        },
      ],
    });
  },
};
