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
    if (!queue || !queue.playing) return void interaction.followUp({ content: '❌ | No music is being played!' });

    const vol = interaction.options.get('amount');
    if (!vol) return void interaction.followUp({ content: `🎧 | Current volume is **${queue.volume}**%!` });
    if (vol.value < 0 || vol.value > 100)
      return void interaction.followUp({ content: '❌ | Volume range must be 0-100' });

    const success = queue.setVolume(vol.value);
    return void interaction.followUp({
      content: success ? `✅ | Volume set to **${vol.value}%**!` : '❌ | Something went wrong!',
    });
  },
};
