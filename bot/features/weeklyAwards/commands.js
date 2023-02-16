const { ApplicationCommandType, PermissionFlagsBits } = require("discord.js");
const { log } = require("../../lib/log");
const { startAward, stopAward } = require(".");
const { db } = require("./db");

/** @type {ChatInputCommand<{ resultMessage: string }, 'cached' | 'raw'>} */
const subCommands = {
  register: {
    description: '初期登録をします。',
    resultMessage: 'リアクション大賞の巡回対象にこのサーバーを登録し、週の報告をこのチャンネルで行うよう設定しました。',
    async func(interaction) {
      const guildId = interaction.guildId;
      const guildName = interaction.guild?.name;
      const channelName = interaction.channel?.name;

      if (guildName == null || channelName == null) {
        await interaction.reply({ content: '登録したいチャンネルの中で実行してください。', ephemeral: true });
        return;
      }
      log('register weeklyAward:', interaction.user.username, guildName);

      db.config.register(guildId, guildName, channelName);
      await startAward(guildId);
    },
  },
  unregister: {
    description: '登録を解除します。',
    resultMessage: 'リアクション大賞の巡回対象からこのサーバーを削除しました。',
    async func(interaction) {
      const guildId = interaction.guildId;
      const guildName = interaction.guild?.name;
      const channelName = interaction.channel?.name;

      if (guildName == null || channelName == null) {
        await interaction.reply({ content: '登録解除したいチャンネルの中で実行してください。', ephemeral: true });
        return;
      }
      log('unregister weeklyAward:', interaction.user.username, guildName);

      stopAward(guildId);
      db.config.unregister(guildId);
    },
  },
};

/** @type {ChatInputCommand} */
module.exports = {
  weeklyaward: {
    description: 'リアクション大賞',
    options: Object.entries(subCommands).map(([name, content]) => ({
      name,
      type: ApplicationCommandType.ChatInput,
      ...content,
    })),
    async func(interaction) {
      const subCommand = interaction.options.getSubcommand(true);

      if (!interaction.inGuild()) {
        await interaction.reply({ content: 'サーバー内で実行してください。', ephemeral: true });
        return;
      }

      const { func, resultMessage } = subCommands[subCommand];
      await interaction.deferReply();
      await func(interaction);
      await interaction.editReply(resultMessage);
    },
    defaultMemberPermissions: PermissionFlagsBits.CreateInstantInvite | PermissionFlagsBits.KickMembers,
  },
};
