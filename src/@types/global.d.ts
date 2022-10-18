import type { Wallet } from '@project-serum/anchor'

// TODO: Verificar se window.solana realmente tem as propriedades de Wallet
interface Solana extends Wallet {
  isPhantom: boolean
  connect (args?: { onlyIfTrusted: boolean }): Promise<{
    publicKey: {
      toString (): string
    }
  }>
}

declare global {
  interface Window {
    solana?: Solana
  }
}

export {}
