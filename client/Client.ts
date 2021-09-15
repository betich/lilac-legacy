import { Client, Collection, Intents, Options } from 'discord.js';

export type Command = {
  name: string;
  description: string;
  options: Options;
  execute: (interaction, player, client) => Promise<void>;
};

class DiscordClient extends Client {
  commands: Collection<string, Command>;
  queue: Map<any, any>;
  config: {
    color: string;
  };

  constructor(config) {
    super({
      intents: [Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS],
    });

    this.commands = new Collection();

    this.queue = new Map();

    this.config = config;
  }
}

export default DiscordClient;
