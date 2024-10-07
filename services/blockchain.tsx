import { ethers, id } from 'ethers'
import address from '@/contracts/contractAddress.json'
import abi from '@/artifacts/contracts/DappFundX.sol/DappFundX.json'
import { CharityParams, CharityStruct, DonorParams, SupportStruct } from '@/utils/type.dt'
import { store } from '@/store'
import { globalActions } from '@/store/globalSlices'

const toWei = (num: number) => ethers.parseEther(num.toString())
const fromWei = (num: number) => ethers.formatEther(num.toString())

let ethereum: any
let tx: any

if (typeof window !== 'undefined') ethereum = (window as any).ethereum
const { setSupports, setCharity } = globalActions
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

//Get admin address
const getAdmin = async (): Promise<string> => {
  const contract = await getEthereumContract()
  const owner = await contract.owner()
  return owner
}

//Get All Charities
const getCharities = async (): Promise<CharityStruct[]> => {
  const contract = await getEthereumContract()
  const charities = await contract.getCharities()
  return structuredCharities(charities)
}

//Get My Charities
const getMyCharities = async (): Promise<CharityStruct[]> => {
  const contract = await getEthereumContract()
  const charities = await contract.getCharities()
  return structuredCharities(charities)
}

//Get Charity
const getCharity = async (id: number): Promise<CharityStruct> => {
  const contract = await getEthereumContract()
  const charity = await contract.getCharity(id)
  return structuredCharities([charity])[0]
}

//Get Supporters
const getSupporters = async (id: number): Promise<SupportStruct[]> => {
  const contract = await getEthereumContract()
  const supporters = await contract.getSupporters(id)
  return structuredSupporters(supporters)
}

//Update Charity
const updateCharity = async (charity: CharityParams): Promise<void> => {
  if (!ethereum) {
    reportError('Please install a wallet provider')
    return Promise.reject(new Error('Browser Provider not installed'))
  }
  try {
    const contract = await getEthereumContract()
    tx = await contract.updateCharity(
      charity.name,
      charity.id,
      charity.fullname,
      charity.profile,
      charity.image,
      charity.description,
      toWei(Number(charity.amount))
    )
    await tx.wait()
    return Promise.resolve(tx)
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

//Create Charity
const createCharity = async (charity: CharityParams): Promise<void> => {
  if (!ethereum) {
    reportError('Please install a wallet provider')
    return Promise.reject(new Error('Browser Provider not installed'))
  }
  try {
    const contract = await getEthereumContract()
    tx = await contract.createCharity(
      charity.name,
      charity.fullname,
      charity.profile,
      charity.image,
      charity.description,
      toWei(Number(charity.amount))
    )
    await tx.wait()
    return Promise.resolve(tx)
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

//Delete Charity
const deleteCharity = async (id: number): Promise<void> => {
  if (!ethereum) {
    reportError('Please install a wallet provider')
    return Promise.reject(new Error('Browser Provider not installed'))
  }
  try {
    const contract = await getEthereumContract()
    tx = await contract.deleteCharity(id)
    await tx.wait()
    return Promise.resolve(tx)
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

//Ban Charity
const banCharity = async (id: number): Promise<void> => {
  if (!ethereum) {
    reportError('Please install a wallet provider')
    return Promise.reject(new Error('Browser Provider not installed'))
  }
  try {
    const contract = await getEthereumContract()
    tx = await contract.toggleBan(id)
    await tx.wait()
    return Promise.resolve(tx)
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
}

//Make Donation
const makeDonation = async (donation: DonorParams): Promise<void> => {
  if (!ethereum) {
    reportError('Please install a wallet provider')
    return Promise.reject(new Error('Browser Provider not installed'))
  }
  try {
    const contract = await getEthereumContract()
    tx = await contract.donate(donation.id, donation.fullname, donation.comment, {
      value: toWei(Number(donation.amount)),
    })
    await tx.wait()

    const supporters = await getSupporters(Number(donation.id))
    store.dispatch(setSupports(supporters))

    const charity = await getCharity(Number(donation.id))
    store.dispatch(setCharity(charity))


    return Promise.resolve(tx)
  } catch (error) {
    reportError(error)
    return Promise.reject(error)
  }
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

export {
  getCharities,
  getMyCharities,
  banCharity,
  deleteCharity,
  getCharity,
  getAdmin,
  makeDonation,
  getSupporters,
  updateCharity,
  createCharity,
}
