export interface IFarmRewardInfo {
  w: bigint
  rewardRate: bigint
  lastUpdateTime: bigint
  lastReserve: bigint
  userInfo: IUserFarmInfo
}

export interface IUserFarmInfo {
  spBalance: bigint
  coolDownTime: number
}
