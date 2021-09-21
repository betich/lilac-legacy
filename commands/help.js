const fs = require('fs');

module.exports = {
  name: 'help',
  description: 'List all available commands.',
  execute(interaction, player, client) {
    let fields = [];
    const allCommands = client.commands;

    for (const [, command] of allCommands.entries()) {
      fields.push({
        name: `⠀\n${command.name}`,
        value: `${command.description}`,
      });
    }

    return void interaction.reply({
      embeds: [
        {
          description:
            'Please note that Lilac is still very early in development. Please give it some time and consider [contributing](https://github.com/betich/lilac) to us on github. Thank you for your patience <3',
          color: 0x7734eb,
        },
        {
          title: '🙋‍♀️ Help',
          description: "use discord's slash (/) commands to run a command",
          color: client.config.color,
          fields,
        },
      ],
    });
  },
};
