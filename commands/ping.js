const { config } = require('dotenv');

module.exports = {
  name: 'ping',
  description: 'Shows bot latency',
  async execute(interaction, player, client) {
    if (!interaction.isCommand() || !interaction.guildId) return;

    if (interaction.commandName === 'ping') {
      await interaction.deferReply();
      const queue = player.getQueue(interaction.guild);

      return void interaction.followUp({
        embeds: [
          {
            title: '⏱️ | Latency',
            fields: [
              { name: 'Bot Latency', value: `\`${Math.round(client.ws.ping)}ms\`` },
              {
                name: 'Voice Latency',
                value: !queue
                  ? 'N/A'
                  : `UDP: \`${queue.connection.voiceConnection.ping.udp ?? 'N/A'}\`ms\nWebSocket: \`${
                      queue.connection.voiceConnection.ping.ws ?? 'N/A'
                    }\`ms`,
              },
            ],
            color: client.config.color,
          },
        ],
      });
    }
  },
};
