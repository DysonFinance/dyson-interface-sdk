import { REWARD_COOL_DOWN_TIME } from '../constants/agency';

export function getRewardCoolDown(gen: number) {
  return REWARD_COOL_DOWN_TIME * (1 + gen);
}
