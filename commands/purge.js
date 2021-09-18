const { Client } = require('discord.js');

module.exports = {
  name: 'purge',
  description: 'Delete the last messages in all chats.',
  options: [
    {
      name: 'num',
      type: 4, //'INTEGER' Type
      description: 'The number of messages you want to delete. (max 100)',
      required: true,
    },
  ],
  async execute(interaction, player, client) {
    const deleteCount = interaction.options.get('num').value;

    if (!deleteCount || deleteCount < 2 || deleteCount > 100)
      return interaction.reply({
        embeds: [
          {
            description: 'Please provide a number between 2 and 100 for the number of messages to delete',
            color: client.config.color,
          },
        ],
      });

    const fetched = await interaction.channel.messages.fetch({
      limit: deleteCount,
    });

    interaction.channel
      .bulkDelete(fetched)
      .then(() => {
        interaction.reply({
          embeds: [
            {
              description: `Succesfully deleted ${deleteCount} messages`,
              color: client.config.color,
            },
          ],
          ephemeral: true,
        });
      })
      .catch(error => {
        interaction.reply({
          embeds: [
            {
              description: `Couldn't delete messages because of: ${error}`,
              color: client.config.color,
            },
          ],
          ephemeral: true,
        });
      });
  },
};
