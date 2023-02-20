import { config } from 'dotenv';

export const URL_REGEX_GLOBAL = /\bhttps?:\/\/\S+/g;
const configOutput = config();

/**
 * @param {string} key
 * @param {string=} [name='token']
 * @returns {string}
 */
export const getEnv = (key, name = 'token') => {
  const token = configOutput.parsed?.[key] ?? process.env[key];
  if (token == null) {
    throw new Error(`${name} is empty`);
  }
  return token;
};

/**
 * @param {string} content
 * @returns {content is Url}
 */
export const isUrl = content => /^https?:\/\/\S+$/.test(content);
