import { FormEvent, useCallback, useEffect, useState } from 'react'
import twitterLogo from './assets/twitter-logo.svg'

import './app.css'

const TEST_GIFS = [
  'https://i.giphy.com/media/eIG0HfouRQJQr1wBzz/giphy.webp',
  'https://media3.giphy.com/media/L71a8LW2UrKwPaWNYM/giphy.gif?cid=ecf05e47rr9qizx2msjucl1xyvuu47d7kf25tqt2lvo024uo&rid=giphy.gif&ct=g',
  'https://media4.giphy.com/media/AeFmQjHMtEySooOc8K/giphy.gif?cid=ecf05e47qdzhdma2y3ugn32lkgi972z9mpfzocjj6z1ro4ec&rid=giphy.gif&ct=g',
  'https://i.giphy.com/media/PAqjdPkJLDsmBRSYUp/giphy.webp',
]

const TWITTER_HANDLE = 'fdaciuk'
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`

export function App () {
  const [walletAddress, setWallletAddress] = useState('')
  const [gifList, setGifList] = useState<string[]>([])

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

  const sendGif = (gif: string) => {
    try {
      const url = new URL(gif)
      console.log('Gif link:', url)
      setGifList(gifs => gifs.concat(url.toString()))
    } catch (e) {
      console.log('Empty input or not a valid URL. Try again.')
    }
  }

  type MyFormEvent = FormEvent<HTMLFormElement> & {
    currentTarget: {
      gif: HTMLInputElement
    }
  }

  const handleSubmit = (e: MyFormEvent) => {
    e.preventDefault()
    const form = e.currentTarget
    const { value } = form.gif
    sendGif(value)
    form.reset()
  }

  const renderNotConnectedContainer = () => (
    <button
      className='cta-button connect-wallet-button'
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  )

  const renderConnectedContainer = () => (
    <div className='connected-container'>
      <form onSubmit={handleSubmit}>
        <input type='text' name='gif' placeholder='Enter gif link!' />
        <button type='submit' className='cta-button submit-gif-button'>
          Submit
        </button>
      </form>
      <div className='gif-grid'>
        {gifList.map(gif => (
          <div className='gif-item' key={gif}>
            <img src={gif} alt={gif} />
          </div>
        ))}
      </div>
    </div>
  )

  useEffect(() => {
    const onLoad = () => checkIfWalletIsConnected()
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  }, [checkIfWalletIsConnected])

  useEffect(() => {
    if (walletAddress.length > 0) {
      console.log('Fetching GIF list...')
      setGifList(TEST_GIFS)
    }
  }, [walletAddress])

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
