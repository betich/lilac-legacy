const { GuildMember } = require('discord.js');
const { sendError } = require('../utils/logs');

module.exports = {
  name: 'nowplaying',
  description: 'Get the song that is currently playing.',
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

    const progress = queue.createProgressBar();
    const perc = queue.getPlayerTimestamp();

    return void interaction.followUp({
      embeds: [
        {
          title: 'Now Playing 🎶',
          description: `🎶 [${queue.current.duration}] [${queue.current.title}](${queue.current.url}) [<@${queue.current.requestedBy.id}>]`,
          fields: [
            {
              name: '\u200b',
              value: progress,
            },
          ],
          color: client.config.color,
        },
      ],
    });
  },
};
