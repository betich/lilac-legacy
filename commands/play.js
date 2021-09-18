const { GuildMember } = require('discord.js');
const { QueryType } = require('discord-player');
const { sendError } = require('../utils/logs');

module.exports = {
  name: 'play',
  description: 'Play a song in your channel!',
  options: [
    {
      name: 'query',
      type: 3, // 'STRING' Type
      description: 'The song you want to play',
      required: true,
    },
  ],
  async execute(interaction, player, client) {
    try {
      if (!(interaction.member instanceof GuildMember) || !interaction.member.voice.channel) {
        return void interaction.reply({
          embeds: [sendError('no_channel', client)],
          ephemeral: true,
        });
      }

      if (
        interaction.guild.me.voice.channelId &&
        interaction.member.voice.channelId !== interaction.guild.me.voice.channelId
      ) {
        return void interaction.reply({
          embeds: [sendError('not_bot_channel', client)],
          ephemeral: true,
        });
      }

      await interaction.deferReply();

      const query = interaction.options.get('query').value;
      const searchResult = await player
        .search(query, {
          requestedBy: interaction.user,
          searchEngine: QueryType.AUTO,
        })
        .catch(() => {});
      if (!searchResult || !searchResult.tracks.length)
        return void interaction.followUp({
          embeds: [
            {
              description: 'No results were found!',
              color: client.config.color,
            },
          ],
        });

      const queue = await player.createQueue(interaction.guild, {
        metadata: interaction.channel,
      });

      try {
        if (!queue.connection) await queue.connect(interaction.member.voice.channel);
      } catch {
        void player.deleteQueue(interaction.guildId);
        return void interaction.followUp({
          embeds: [
            {
              description: 'Could not join your voice channel!',
              color: client.config.color,
            },
          ],
        });
      }

      await interaction.followUp({
        embeds: [
          {
            description: `Queued ${
              searchResult.playlist
                ? `${searchResult.tracks.length} tracks`
                : `[${searchResult.tracks[0].title}](${searchResult.tracks[0].url})`
            } [<@${interaction.member.id}>]`,
            color: client.config.color,
          },
        ],
      });

      searchResult.playlist ? queue.addTracks(searchResult.tracks) : queue.addTrack(searchResult.tracks[0]);
      if (!queue.playing) await queue.play();
    } catch (error) {
      console.log(error);
      interaction.followUp({
        embeds: [
          {
            description: `There was an error trying to execute that command: ${error.message}`,
            color: client.config.errorColor,
          },
        ],
      });
    }
  },
};
