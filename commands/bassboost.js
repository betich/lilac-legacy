const { sendError } = require('../utils/logs');

module.exports = {
  name: 'bassboost',
  description: 'Toggles bassboost filter',
  options: [
    {
      name: 'enabled',
      type: 'INTEGER',
      description: 'Status of the bassboost filter',
      required: true,
      choices: [
        {
          name: 'Off',
          value: false,
        },
        {
          name: 'On',
          value: true,
        },
      ],
    },
  ],
  async execute(interaction, player, client) {
    await interaction.deferReply();
    const queue = player.getQueue(interaction.guildId);

    const filterEnabled = Boolean(interaction.options.get('enabled').value);

    if (!queue || !queue.playing) return void interaction.followUp({ embeds: [sendError('no_current_music', client)] });

    // old method: !queue.getFiltersEnabled().includes('bassboost')
    await queue.setFilters({
      bassboost: filterEnabled,
      normalizer2: filterEnabled, // because we need to toggle it with bass
    });

    return void interaction.followUp({
      embeds: [
        {
          description: `🎵 | Bassboost ${queue.getFiltersEnabled().includes('bassboost') ? 'Enabled' : 'Disabled'}!`,
          color: client.config.color,
        },
      ],
    });
  },
};
