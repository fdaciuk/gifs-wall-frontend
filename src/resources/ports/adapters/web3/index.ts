import * as web3 from '@/resources/ports/solana'
import * as types from './types'
export * from './types'

export const getBaseAccountData: types.GetBaseAccountData = () =>
  web3.getBaseAccountData()

export const startup = async (): Promise<void> => web3.startup()
export const getAddressIfIsTrusted = async (): Promise<string> =>
  web3.getAddressIfIsTrusted()

export const getWalletAddress = async (): Promise<string> =>
  web3.getWalletAddress()

export const addGifToBlockchain = async (gif: string): Promise<void> =>
  web3.addGifToBlockchain(gif)
