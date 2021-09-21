const { QueueRepeatMode } = require('discord-player');
const { sendError } = require('../utils/logs');

module.exports = {
  name: 'loop',
  description: 'Loop the current song!',
  options: [
    {
      name: 'mode',
      type: 'INTEGER',
      description: 'Loop type',
      required: true,
      choices: [
        {
          name: 'Off',
          value: QueueRepeatMode.OFF,
        },
        {
          name: 'Track',
          value: QueueRepeatMode.TRACK,
        },
        {
          name: 'Queue',
          value: QueueRepeatMode.QUEUE,
        },
        {
          name: 'Autoplay',
          value: QueueRepeatMode.AUTOPLAY,
        },
      ],
    },
  ],
  async execute(interaction, player, client) {
    await interaction.deferReply();

    const queue = player.getQueue(interaction.guildId);
    if (!queue || !queue.playing) return void interaction.followUp({ embeds: [sendError('no_current_music', client)] });

    const loopMode = interaction.options.get('mode').value;
    const success = queue.setRepeatMode(loopMode);
    const mode = loopMode === QueueRepeatMode.TRACK ? '🔂' : loopMode === QueueRepeatMode.QUEUE ? '🔁' : '▶';

    return void interaction.followUp({
      embeds: [
        {
          description: success ? `${mode} Updated loop mode` : 'Could not update loop mode',
          color: success ? client.config.color : client.config.errorColor,
        },
      ],
    });
  },
};
