const { sendError } = require('../utils/logs');

module.exports = {
  name: 'volume',
  description: 'Sets music volume',
  options: [
    {
      name: 'amount',
      type: 'INTEGER',
      description: 'The volume amount to set (0-100)',
      required: false,
    },
  ],
  async execute(interaction, player, client) {
    await interaction.deferReply();
    const queue = player.getQueue(interaction.guildId);
    if (!queue || !queue.playing) return void interaction.followUp({ embeds: [sendError('no_current_music', client)] });

    const vol = interaction.options.get('amount');

    if (!vol)
      return void interaction.followUp({
        embeds: [
          {
            description: `🎧 | Current volume is **${queue.volume}**%!`,
            color: client.config.color,
          },
        ],
      });

    if (vol.value < 0 || vol.value > 100)
      return void interaction.followUp({
        embeds: [
          {
            description: '❌ | Volume range must be 0-100',
            color: client.config.color,
          },
        ],
      });

    const success = queue.setVolume(vol.value);
    return void interaction.followUp({
      embeds: [
        {
          description: success ? `✅ | Volume set to **${vol.value}%**!` : '❌ | Something went wrong!',
          color: client.config.color,
        },
      ],
    });
  },
};
