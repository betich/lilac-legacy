const fs = require('fs');
// const Discord = require('discord.js');
const Client = require('./client/Client');
const { token, prefix } = require('./config.js');
const { Player } = require('discord-player');

const client = new Client({ color: 0x7734eb });

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

console.log(client.commands);

const player = new Player(client);

const logInfo = queue => `${new Date()} | ${queue.guild.name} | `;

player.on('error', (queue, error) => {
  console.error(logInfo(queue) + `[${queue.guild.name}] Error emitted from the queue: ${error.message}`);
});

player.on('connectionError', (queue, error) => {
  console.error(logInfo(queue) + `[${queue.guild.name}] Error emitted from the connection: ${error.message}`);
});

player.on('trackStart', (queue, track) => {
  console.log(logInfo(queue) + `🎶 | Started playing: **${track.title}** in **${queue.connection.channel.name}**!`);
  queue.metadata.send(`🎶 | Started playing: **${track.title}** in **${queue.connection.channel.name}**!`);
});

player.on('trackAdd', (queue, track) => {
  console.log(logInfo(queue) + `🎶 | Track **${track.title}** queued!`);
  queue.metadata.send(`🎶 | Track **${track.title}** queued!`);
});

player.on('botDisconnect', queue => {
  console.log(logInfo(queue) + '❌ | I was manually disconnected from the voice channel, clearing queue!');
  queue.metadata.send('❌ | I was manually disconnected from the voice channel, clearing queue!');
});

player.on('channelEmpty', queue => {
  console.log(logInfo(queue) + '❌ | Nobody is in the voice channel, leaving...');
  queue.metadata.send('❌ | Nobody is in the voice channel, leaving...');
});

player.on('queueEnd', queue => {
  console.log(logInfo(queue) + '✅ | Queue finished!');
  queue.metadata.send('✅ | Queue finished!');
});

client.once('ready', async () => {
  console.log('Ready!');

  console.log(`🚀 Deploying to ${client.guilds.cache.size} servers`);

  await client.guilds.cache.forEach(async g => {
    await g.commands
      .set(client.commands)
      .then(() => {
        console.log(`Deployed to ${g.name}`);
      })
      .catch(err => {
        console.error(err);
      });
  });

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

  try {
    command.execute(interaction, player, client);
  } catch (error) {
    console.error(error);
    interaction.followUp({
      content: 'There was an error trying to execute that command!',
    });
  }
});

client.on('guildCreate', async guild => {
  console.log(`Joined ${guild.name}`);

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
