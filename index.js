const fs = require('fs');
// const Discord = require('discord.js');
const Client = require('./client/Client');
const { token, prefix } = require('./config.js');
const { Player } = require('discord-player');

// purple 0x7734eb
// black 0x262626
const client = new Client({ color: 0x262626, errorColor: 0xfc0f03 });
client.on('error', console.error);
client.on('warn', console.warn);

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

const player = new Player(client);

// just logging things hehe
const timeLog = () => {
  const d = new Date();

  return `${d.getUTCDate()}/${d.getUTCMonth() + 1}/${d.getUTCFullYear()} ${d.toLocaleTimeString('th-TH', {
    timeZone: 'Asia/Bangkok',
  })}`;
};

const logInfo = queue => `${timeLog()} | ${queue?.guild?.name ?? '📝'} | `;

player.on('error', (queue, error) => {
  console.error(logInfo(queue) + `⚠ Error emitted from the queue: ${error.message}`);
});

player.on('connectionError', (queue, error) => {
  console.error(logInfo(queue) + `⚠ Error emitted from the connection: ${error.message}`);
});

player.on('trackStart', (queue, track) => {
  console.log(logInfo(queue) + `🎶 | Started playing: ${track.title} in ${queue.connection.channel.name}!`);

  queue.metadata
    .send({
      embeds: [
        {
          color: client.config.color,
          fields: [
            {
              name: 'Now Playing 🎶',
              value: `[${track.title}](${track.url}) [<@${track.requestedBy.id}>]`,
            },
          ],
        },
      ],
    })
    .then(msg => {
      setTimeout(() => msg.delete(), 30 * 1000);
    });
});

player.on('connectionCreate', (queue, connection) => {
  client.activeConnections.set(connection.channel.guildId, { connection, manualDisconnect: false });
});

player.on('trackAdd', (queue, track) => {
  console.log(logInfo(queue) + `🎶 | Track ${track.title} queued!`);
  /*
  queue.metadata.send({
    embeds: [
      {
        description: `Queued [${track.title}](${track.url}) [<@${track.requestedBy.id}>]`,
        color: client.config.color,
      },
    ],
  });
  */
});

player.on('botDisconnect', queue => {
  console.log(logInfo(queue) + '❌ | Bot has disconnected from the voice channel');

  const { connection: currentConnection } = client.activeConnections.get(queue.metadata.guildId);

  if (currentConnection) client.activeConnections.delete(currentConnection.channel.guildId);
});

player.on('queueEnd', async queue => {
  console.log(logInfo(queue) + '✅ | Queue finished!');

  // get the connection info
  const { connection: currentConnection, manualDisconnect } = client.activeConnections.get(queue.metadata.guildId);

  // if the bot is intentionally disconnected (from commands, empty array), don't do anything else
  if (manualDisconnect) {
    // delete the connection info from the connections Map
    return void client.activeConnections.delete(currentConnection.channel.guildId);
  }

  // set a timer from when the queue ends, if done disconnect the bot
  const disconnectTimer = setTimeout(() => {
    console.log(logInfo(queue) + 'disconnecting due to inactvity');

    currentConnection.disconnect();

    // delete the connection info from the connections Map
    client.activeConnections.delete(currentConnection.channel.guildId);

    queue.metadata.send({
      embeds: [
        {
          description:
            'Disconnected due to inactivity. If you want me to stay in the voice channel 24/7, please send me money irl (just kidding).',
          color: client.config.color,
        },
      ],
    });
  }, 5 * 60 * 1000); // 5 mins

  player.on('trackAdd', () => {
    clearTimeout(disconnectTimer);
  });
});

client.once('ready', async () => {
  // set up commands
  await Promise.all(
    client.guilds.cache.map(async guild => {
      await guild.commands
        .set(client.commands)
        .then(() => {
          console.log(`🚀 Deploying to ${guild.name}...`);
        })
        .catch(err => {
          console.error(err);
        });
    }),
  ).then(() => {
    console.log(`🚀 Deployed to ${client.guilds.cache.size} server${client.guilds.cache.size > 1 ? 's' : ''}`);
    console.log('Ready!');
  });

  // log all connections
  setInterval(() => {
    const connections = client.activeConnections.size;
    console.log(logInfo() + `Connected to ${connections} voice channel${connections > 1 ? 's' : ''}`);
  }, 1 * 60 * 1000); // every 1 min

  client.user.setActivity(`with your feelings`, { type: 'PLAYING' });
});

client.once('reconnecting', () => {
  console.log('Reconnecting!');
});

client.once('disconnect', () => {
  console.log('Disconnect!');
});

client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;
  if (!client.application?.owner) await client.application?.fetch();

  if (message.content === `${prefix}deploy` || message.content === `${prefix}setup`) {
    await message.guild.commands
      .set(client.commands)
      .then(() => {
        message.reply('🚀 Deployed!');
      })
      .catch(err => {
        message.reply('Could not deploy commands! Make sure the bot has the application.commands permission!');
        console.error(err);
      });
    // if (message.member.permissions.has('ADMINISTRATOR')) {
    // } else {
    //   message.reply('You need to have an adminstrator permission to use that command!');
    // }
  } else {
    if (message.content.startsWith(prefix)) {
      try {
        const [commandName, ...args] = message.content.substring(prefix.length).split(/\s+/g);
        const context = {
          message,
          args,
        };

        const command =
          client.commands.get(commandName) ||
          client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) {
          return void message.reply('Unkown command');
        }

        // execute message
        command.executeMessage(message, player, client);
      } catch (error) {
        message.reply('There was an error.');
        console.error(error);
      }
    }
  }
});

client.on('interactionCreate', async interaction => {
  const command = client.commands.get(interaction.commandName.toLowerCase());

  console.log(logInfo() + `Command ${command.name} has been called.`);

  try {
    command.execute(interaction, player, client);
  } catch (error) {
    console.error(error);
    interaction.followUp({
      embeds: [{ description: 'There was an error trying to execute that command', color: client.config.errorColor }],
    });
  }
});

client.on('guildCreate', async guild => {
  console.log(`👋 Joined ${guild.name}`);

  await guild.commands
    .set(client.commands)
    .then(() => {
      console.log(`🚀 Deployed to ${guild.name}`);
    })
    .catch(err => {
      console.error(err);
    });
});

client.login(token);
