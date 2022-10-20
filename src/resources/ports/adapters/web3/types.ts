export type GifItem = {
  gifLink: string
  userAddress: string
}

export type Account = {
  gifList: GifItem[]
  totalGifs: number
}

export type GetBaseAccountData = () => Promise<Account>
