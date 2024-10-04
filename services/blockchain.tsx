import { ethers } from 'ethers'
import address from '@/contracts/contractAddress.json'
import abi from '@/artifacts/contracts/DappFundX.sol/DappFundX.json'
import { CharityStruct } from '@/utils/type.dt'

const toWei = (num: number) => ethers.parseEther(num.toString())
const fromWei = (num: number) => ethers.formatEther(num.toString())

let ethereum: any
let tx: any

if (typeof window !== 'undefined') ethereum = (window as any).ethereum

const getEthereumContract = async () => {
  const account = await ethereum.request({ method: 'eth_Accounts' })
  if (account?.length > 0) {
    const provider = new ethers.BrowserProvider(ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(address.dappFundContract, abi.abi, signer)
    return contract
  } else {
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL)
    const wallet = ethers.Wallet.createRandom()
    const signer = wallet.connect(provider)
    const contract = new ethers.Contract(address.dappFundContract, abi.abi, signer)
    return contract
  }
}

const getCharities = async (): Promise<CharityStruct[]> => {
  const contract = await getEthereumContract()
  const charities = await contract.getCharities()
  return charities
}



export { getCharities }
