import { EventEmitter } from 'events'
import { Account, mnemonicToAccount } from 'viem/accounts'

export const listOfAccounts: Account[] = [
  mnemonicToAccount(import.meta.env.VITE_PRIVATE_KEY, { addressIndex: 0 }),
  mnemonicToAccount(import.meta.env.VITE_PRIVATE_KEY, { addressIndex: 1 }),
  mnemonicToAccount(import.meta.env.VITE_PRIVATE_KEY, { addressIndex: 2 }),
  mnemonicToAccount(import.meta.env.VITE_PRIVATE_KEY, { addressIndex: 3 }),
  mnemonicToAccount(import.meta.env.VITE_PRIVATE_KEY, { addressIndex: 4 }),
  mnemonicToAccount(import.meta.env.VITE_PRIVATE_KEY, { addressIndex: 5 }),
  mnemonicToAccount(import.meta.env.VITE_PRIVATE_KEY, { addressIndex: 6 }),
  mnemonicToAccount(import.meta.env.VITE_PRIVATE_KEY, { addressIndex: 7 }),
  mnemonicToAccount(import.meta.env.VITE_PRIVATE_KEY, { addressIndex: 8 }),
  mnemonicToAccount(import.meta.env.VITE_PRIVATE_KEY, { addressIndex: 9 }),
]

class AccountManager extends EventEmitter {
  #self_list = listOfAccounts
  #manage_list = new Set<Account>()
  constructor() {
    super()
  }

  async getAccount(): Promise<Account> {
    if (this.#self_list.length) {
      const account = this.#self_list.pop()
      this.#manage_list.add(account!)
      return account!
    } else {
      await new Promise((res) => this.once('release', res))
      return this.getAccount()
    }
  }

  release(account: Account) {
    this.#manage_list.delete(account)
    this.#self_list.push(account)
    this.emit('release', account)
  }
}

export const accountManager = new AccountManager()
