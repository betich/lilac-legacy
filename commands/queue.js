const { sendError } = require('../utils/logs');

module.exports = {
  name: 'queue',
  description: 'See the queue',
  async execute(interaction, player, client) {
    await interaction.deferReply();
    const queue = player.getQueue(interaction.guildId);
    if (!queue || !queue.playing) return void interaction.followUp({ embeds: [sendError('no_current_music', client)] });

    const currentTrack = queue.current;
    const tracks = queue.tracks.slice(0, 10).map((m, i) => {
      return `${i + 1}. ${m.duration} ([${m.title}](${m.url})) [<@${m.requestedBy.id}>]`;
    });

    return void interaction.followUp({
      embeds: [
        {
          description: `${tracks.join('\n')}${
            queue.tracks.length > tracks.length
              ? `\n...${
                  queue.tracks.length - tracks.length === 1
                    ? `${queue.tracks.length - tracks.length} more track`
                    : `${queue.tracks.length - tracks.length} more tracks`
                }`
              : ''
          }`,
          color: client.config.color,
          fields: [
            {
              name: 'Now Playing',
              value: `🎶 [${currentTrack.duration}] [${currentTrack.title}](${currentTrack.url})`,
            },
          ],
        },
      ],
    });
  },
};
