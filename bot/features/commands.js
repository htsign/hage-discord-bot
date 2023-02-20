import { Events } from 'discord.js';
import client from '../client';
import { log } from '../lib/log';

import shortenUrlCommands from './shortenUrl/commands';
import weeklyAwardsCommands from './weeklyAwards/commands';
import regionalIndicatorsCommands from './regionalIndicators/commands';

/**
 * @type {import('./_types').ChatInputCommandCollection<{}>}
 */
const commands = {
  ...shortenUrlCommands,
  ...weeklyAwardsCommands,
  ...regionalIndicatorsCommands,
};

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { user, commandName } = interaction;

  log(user.username, 'command kicked:', commandName);

  const command = commands[commandName];
  if (command == null) {
    throw new Error('invalid command name');
  }
  return command.func(interaction);
});

client.once(Events.ClientReady, async () => {
  const app = await client.application?.fetch();

  if (app == null) {
    return log('application fetching is failed.');
  }
  const _commands = Object.entries(commands).map(([name, content]) => ({ ...content, name }));
  app.commands.set(_commands);
});
