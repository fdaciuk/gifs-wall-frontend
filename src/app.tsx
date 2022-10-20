import { FormEvent, useCallback, useEffect, useState } from 'react'
import twitterLogo from './assets/twitter-logo.svg'
import {
  addGifToBlockchain,
  getAddressIfIsTrusted,
  getBaseAccountData,
  getWalletAddress,
  startup,
  GifItem,
} from '@/resources/ports/adapters/web3'

import './app.css'

const TWITTER_HANDLE = 'fdaciuk'
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`

export function App () {
  const [walletAddress, setWalletAddress] = useState('')
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
    await startup()
    await getGifList()
  }, [getGifList])

  const checkIfWalletIsConnected = useCallback(async () => {
    const walletAddress = await getAddressIfIsTrusted()
    setWalletAddress(walletAddress)
  }, [])

  const connectWallet = useCallback(async () => {
    const walletAddress = await getWalletAddress()
    setWalletAddress(walletAddress)
  }, [])

  const sendGif = async (gif: string) => {
    await addGifToBlockchain(gif)
    await getGifList()
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
