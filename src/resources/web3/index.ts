import { Connection, PublicKey, clusterApiUrl, ConfirmOptions } from '@solana/web3.js'
import { Program, AnchorProvider, web3 } from '@project-serum/anchor'
import keyPairJson from '@/keypair.json'

const { SystemProgram } = web3

const kp = keyPairJson as any // TODO: remove any and type properly
const arr: number[] = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
export const baseAccount = web3.Keypair.fromSecretKey(secret)

const programID = new PublicKey('8oJLsdGcukkSvFor38wbJvkU3UUgGhsuadHSGJHW4PtZ')
const network = clusterApiUrl('devnet')

const opts: ConfirmOptions = {
  preflightCommitment: 'processed',
}

export const getProvider = () => {
  const connection = new Connection(network, opts.preflightCommitment)
  const provider = new AnchorProvider(
    connection,
    getSolanaClient(),
    opts,
  )
  return provider
}

export const getSolanaClient = () => {
  const { solana } = window
  if (typeof solana === 'undefined') {
    throw new Error('Solana object not found! Get a Phantom Wallet 👻')
  }

  if (solana.isPhantom !== true) {
    throw new Error('You need a Phantom Wallet 👻')
  }

  return solana
}

export type GifItem = {
  gifLink: string
  userAddress: string
}

type Account = {
  gifList: GifItem[]
  totalGifs: number
}

type GetBaseAccountData = () => Promise<Account>
export const getBaseAccountData: GetBaseAccountData = async () => {
  const program = await getProgram()
  const account = await program.account.baseAccount.fetch(baseAccount.publicKey)

  if (isAccount(account)) {
    return account
  }

  throw new Error('Account invalid')
}

const isAccount = (account: any): account is Account => {
  if (typeof account !== 'object') {
    return false
  }

  if (account === null) {
    return false
  }

  return Object.hasOwn(account, 'gifList') &&
    Object.hasOwn(account, 'totalGifs')
}

export const getProgram = async () => {
  const idl = await Program.fetchIdl(programID, getProvider())
  if (idl === null) {
    throw new Error('fn getProgram: IDL is null')
  }
  return new Program(idl, programID, getProvider())
}

export const startup = async () => {
  try {
    const provider = getProvider()
    const program = await getProgram()

    // TODO: rpc is deprecated
    await program.rpc.startStuffOff({
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [baseAccount],
    })
    console.log('Created a new BaseAccount w/ address:', baseAccount.publicKey.toString())
  } catch (error) {
    console.error('Error creating baseAccount:', error)
  }
}

export const getAddressIfIsTrusted = async (): Promise<string> => {
  return getWalletKeyString({ onlyIfTrusted: true })
}

export const getWalletAddress = async (): Promise<string> => {
  return getWalletKeyString()
}

type ConnectOptions = {
  onlyIfTrusted: boolean
}

const getWalletKeyString = async (options?: ConnectOptions): Promise<string> => {
  try {
    const solana = getSolanaClient()
    console.log('Phantom wallet found!')
    const response = await solana.connect(options)
    const keyString = response.publicKey.toString()
    console.log(
      'Connected with Public Key:',
      response.publicKey,
      typeof response.publicKey,
      keyString,
    )
    return keyString
  } catch (e) {
    console.error('Error: connectWallet: ', e)
    return ''
  }
}

export const addGifToBlockchain = async (gif: string) => {
  try {
    const url = new URL(gif)
    console.log('Gif link:', url)

    const provider = getProvider()
    const program = await getProgram()
    // TODO: rpc is deprecated
    await program.rpc.addGif(gif, {
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
      },
    })
  } catch (e) {
    console.log('Empty input or not a valid URL. Try again.', e)
  }
}
