import { useCallback, useEffect, useState } from 'react'
import twitterLogo from './assets/twitter-logo.svg'

import './app.css'

const TWITTER_HANDLE = 'fdaciuk'
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`

export function App () {
  const [walletAddress, setWallletAddress] = useState('')
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

  const renderNotConnectedContainer = () => (
    <button
      className='cta-button connect-wallet-button'
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  )

  useEffect(() => {
    const onLoad = () => checkIfWalletIsConnected()
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  }, [checkIfWalletIsConnected])

  return (
    <div className='App'>
      <div className={walletAddress ? 'authed-container' : 'container'}>
        <div className='header-container'>
          <p className='header'>🖼 GIF Portal</p>
          <p className='sub-text'>
            View your GIF collection in the metaverse ✨
          </p>
          {walletAddress === '' && renderNotConnectedContainer()}
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
