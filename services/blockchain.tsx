import { ethers } from 'ethers'
import address from '@/contracts/contractAddress.json'
import abi from '@/artifacts/contracts/DappFundX.sol/DappFundX.json'
import { CharityStruct, SupportStruct } from '@/utils/type.dt'
import Supports from '@/components/Supports'

const toWei = (num: number) => ethers.parseEther(num.toString())
const fromWei = (num: number) => ethers.formatEther(num.toString())

let ethereum: any
let tx: any

if (typeof window !== 'undefined') ethereum = (window as any).ethereum

const getEthereumContract = async () => {
  const account = await ethereum?.request?.({ method: 'eth_Accounts' })
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
  return structuredCharities(charities)
}

const getMyCharities = async (): Promise<CharityStruct[]> => {
  const contract = await getEthereumContract()
  const charities = await contract.getMyCharities()
  return structuredCharities(charities)
}

const getCharity = async (id: number): Promise<CharityStruct> => {
  const contract = await getEthereumContract()
  const charity = await contract.getCharity(id)
  return structuredCharities([charity])[0]
}

const getSupporters = async (id: number): Promise<SupportStruct[]> => {
  const contract = await getEthereumContract()
  const supporters = await contract.getSupporters(id)
  return structuredSupporters(supporters)
}

const structuredCharities = (charities: CharityStruct[]): CharityStruct[] =>
  charities
    .map((charity) => ({
      id: Number(charity.id),
      name: charity.name,
      fullname: charity.fullname,
      description: charity.description,
      amount: parseFloat(fromWei(charity.amount)),
      raised: parseFloat(fromWei(charity.raised)),
      donations: Number(charity.donations),
      image: charity.image,
      profile: charity.profile,
      owner: charity.owner,
      timestamp: Number(charity.timestamp),
      deleted: charity.deleted,
      banned: charity.banned,
    }))
    .sort((a, b) => b.timestamp - a.timestamp)

const structuredSupporters = (supports: SupportStruct[]): SupportStruct[] =>
  supports
    .map((support) => ({
      id: Number(support.id),
      cid: Number(support.cid),
      fullname: support.fullname,
      amount: parseFloat(fromWei(support.amount)),
      supporter: support.supporter,
      comment: support.comment,
      timestamp: Number(support.timestamp),
    }))
    .sort((a, b) => b.timestamp - a.timestamp)

export { getCharities, getMyCharities, getCharity, getSupporters }
