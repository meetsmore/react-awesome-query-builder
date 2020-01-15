import * as constants from '../constants';

export const setRuleAction = (config, path, value) => ({
  type: constants.SET_RULE_ACTION,
  path: path,
  value: value,
  config: config,
});