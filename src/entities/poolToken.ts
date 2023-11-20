import { ChainId } from '@/constants'

export interface TokenDataType<T = string> {
  icon: string
  fullName: string
  name: string
  decimals: number
  address: { [chain in ChainId]?: string }
  type: T
}

export interface PoolTokenDataType<T = string> extends TokenDataType<T> {
  tokenPriceConfig: TokenPriceConfig
}

export interface TokenPriceConfig {
  coinGeckoApiId?: string
  chainLinkFeed?: { [chain in ChainId]?: string }
  dysonPool?: { [chain in ChainId]?: string }
  constantPrice?: number
  pythFeedId?: { [chain in ChainId]?: string }
}

export class PoolToken<TokenType extends string> {
  #cachedOfTokenInfoAddress = new Map<string, PoolTokenDataType<TokenType>>()
  static createPoolTokenDict<TokenType extends string>(
    dict: Record<TokenType, PoolTokenDataType<TokenType>>,
    chainList: number[],
  ) {
    return new PoolToken(dict, chainList)
  }

  constructor(
    public PoolTokenData: Record<TokenType, PoolTokenDataType<TokenType>>,
    public chainList: number[],
  ) {}

  getPoolTokenDataType(tokenAddress: string) {
    if (!tokenAddress) return
    const _tokenAddress = tokenAddress.toLowerCase()
    const savedAddress = this.#cachedOfTokenInfoAddress.get(tokenAddress)
    if (savedAddress) return savedAddress
    for (const [, tokenInfo] of Object.entries<PoolTokenDataType<TokenType>>(
      this.PoolTokenData,
    )) {
      if (
        this.chainList
          .map((chain) => tokenInfo.address[chain as ChainId] ?? '')
          .filter((e) => !!e)
          .map((address) => address.toLowerCase())
          .includes(_tokenAddress)
      ) {
        this.#cachedOfTokenInfoAddress.set(_tokenAddress, tokenInfo)
        return tokenInfo as PoolTokenDataType
      }
    }
  }
}
