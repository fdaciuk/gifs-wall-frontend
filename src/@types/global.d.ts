declare global {
  interface Window {
    solana?: {
      isPhantom: boolean
      connect (args?: { onlyIfTrusted: boolean }): Promise<{
        publicKey: {
          toString (): string
        }
      }>
    }
  }
}

export {}
