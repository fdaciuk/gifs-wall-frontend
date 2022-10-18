import { Buffer } from 'buffer'
import { FormEvent, useCallback, useEffect, useState } from 'react'
import { Connection, PublicKey, clusterApiUrl, ConfirmOptions } from '@solana/web3.js'
import { Program, AnchorProvider, web3 } from '@project-serum/anchor'
import twitterLogo from './assets/twitter-logo.svg'
import keyPairJson from './keypair.json'

import './app.css'

// TODO: move to another file
window.Buffer = Buffer

const { SystemProgram } = web3

const kp = keyPairJson as any // TODO: remove any and type properly
const arr: number[] = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)

const programID = new PublicKey('8oJLsdGcukkSvFor38wbJvkU3UUgGhsuadHSGJHW4PtZ')
const network = clusterApiUrl('devnet')

const opts: ConfirmOptions = {
  preflightCommitment: 'processed',
}

const getProvider = () => {
  const connection = new Connection(network, opts.preflightCommitment)
  const provider = new AnchorProvider(
    connection,
    getSolanaClient(),
    opts,
  )
  return provider
}

const getSolanaClient = () => {
  const { solana } = window
  if (typeof solana === 'undefined') {
    throw new Error('Solana object not found! Get a Phantom Wallet 👻')
  }

  if (solana.isPhantom === false) {
    throw new Error('You need a Phantom Wallet 👻')
  }

  return solana
}

type GifItem = {
  gifLink: string
  userAddress: string
}

type Account = {
  gifList: GifItem[]
  totalGifs: number
}

type GetBaseAccountData = () => Promise<Account>
const getBaseAccountData: GetBaseAccountData = async () => {
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

const getProgram = async () => {
  const idl = await Program.fetchIdl(programID, getProvider())
  if (idl === null) {
    throw new Error('fn getProgram: IDL is null')
  }
  return new Program(idl, programID, getProvider())
}

const TWITTER_HANDLE = 'fdaciuk'
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`

export function App () {
  const [walletAddress, setWallletAddress] = useState('')
  const [gifList, setGifList] = useState<GifItem[] | null>([])

  const getGifList = useCallback(async () => {
    try {
      const account = await getBaseAccountData()
      console.log('Got the account:', account)
      setGifList(account.gifList)
    } catch (error) {
      console.error('Error in getGiflist:', error)
      setGifList(null)
    }
  }, [])

  const createGifAccount = useCallback(async () => {
    try {
      const provider = getProvider()
      const program = await getProgram()

      console.log('ping')

      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount],
      })
      console.log('Created a new BaseAccount w/ address:', baseAccount.publicKey.toString())
      await getGifList()
    } catch (error) {
      console.error('Error creating baseAccount:', error)
    }
  }, [getGifList])

  const checkIfWalletIsConnected = useCallback(async () => {
    try {
      const solana = getSolanaClient()

      console.log('Phantom wallet found!')
      const response = await solana.connect({ onlyIfTrusted: true })
      const keyString = response.publicKey.toString()
      console.log(
        'Connected with Public Key:',
        response.publicKey,
        typeof response.publicKey,
        keyString,
      )
      setWallletAddress(keyString)
    } catch (e) {
      console.error('Error:', e)
    }
  }, [])

  const connectWallet = async () => {
    try {
      const solana = getSolanaClient()
      const response = await solana.connect()
      setWallletAddress(response.publicKey.toString())
    } catch (e) {
      console.error('Error: connectWallet: ', e)
    }
  }

  const sendGif = async (gif: string) => {
    try {
      const url = new URL(gif)
      console.log('Gif link:', url)

      const provider = getProvider()
      const program = await getProgram()
      await program.rpc.addGif(gif, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      })

      await getGifList()
    } catch (e) {
      console.log('Empty input or not a valid URL. Try again.', e)
    }
  }

  type MyFormEvent = FormEvent<HTMLFormElement> & {
    currentTarget: {
      gif: HTMLInputElement
    }
  }

  const handleSubmit = async (e: MyFormEvent) => {
    e.preventDefault()
    const form = e.currentTarget
    const { value } = form.gif
    await sendGif(value)
    form.reset()
  }

  useEffect(() => {
    const onLoad = () => checkIfWalletIsConnected()
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  }, [checkIfWalletIsConnected])

  useEffect(() => {
    if (walletAddress.length > 0) {
      console.log('Fetching GIF list...')
      getGifList()
    }
  }, [walletAddress, getGifList])

  const renderNotConnectedContainer = () => (
    <button
      className='cta-button connect-wallet-button'
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  )

  const renderConnectedContainer = () => {
    if (gifList === null) {
      return (
        <div className='connected-container'>
          <button className='cta-button submit-gif-button' onClick={createGifAccount}>
            Do One-Time Initialization For GIF Program Account
          </button>
        </div>
      )
    }

    return (
      <div className='connected-container'>
        <form onSubmit={handleSubmit}>
          <input type='text' name='gif' placeholder='Enter gif link!' />
          <button type='submit' className='cta-button submit-gif-button'>
            Submit
          </button>
        </form>
        <div className='gif-grid'>
          {console.log('gifList:', gifList)}
          {gifList.map(item => (
            <div className='gif-item' key={item.gifLink}>
              <img src={item.gifLink} alt={item.gifLink} />
              <p>{item.userAddress.toString()}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className='App'>
      <div className={walletAddress ? 'authed-container' : 'container'}>
        <div className='header-container'>
          <p className='header'>🖼 GIF Portal</p>
          <p className='sub-text'>
            View your GIF collection in the metaverse ✨
          </p>
          {
            walletAddress === ''
              ? renderNotConnectedContainer()
              : renderConnectedContainer()
          }
        </div>
        <div className='footer-container'>
          <img alt='Twitter Logo' className='twitter-logo' src={twitterLogo} />
          <a
            className='footer-text'
            href={TWITTER_LINK}
            target='_blank'
            rel='noreferrer'
          >
            {`built on @${TWITTER_HANDLE}`}
          </a>
        </div>
      </div>
    </div>
  )
}
