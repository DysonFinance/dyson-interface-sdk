import { ChainId } from '@/constants';

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
}


export class PoolToken<TokenType extends string> {
  #cachedOfTokenInfoAddress = new Map<string, PoolTokenDataType<TokenType>>()
  static createPoolTokenDict<TokenType extends string>(dict: Record<TokenType, PoolTokenDataType<TokenType>>) {
    return new PoolToken(dict)
  }

  constructor (public PoolTokenData: Record<TokenType, PoolTokenDataType<TokenType>>) {
  }

  getPoolTokenDataType(tokenAddress: string) {
    if (!tokenAddress) return
    const _tokenAddress = tokenAddress.toLowerCase()
    const savedAddress = this.#cachedOfTokenInfoAddress.get(tokenAddress)
    if (savedAddress) return savedAddress
    for (const [, tokenInfo] of Object.entries<PoolTokenDataType<TokenType>>(this.PoolTokenData)) {
      if (
        Object.values(tokenInfo.address)
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