const { expect } = require('chai')
const { ethers } = require('hardhat')

const toWei = (num) => ethers.parseEther(num.toString())
const fromWei = (num) => ethers.formatEther(num)

describe('Contracts', () => {
  let contract, result
  const taxPct = 5
  const id = 1
  const cid = 1
  const name = 'My First Charity'
  const fullname = 'John Doe'
  const description = 'My First Ever Charity Reminicence'
  const profile = 'https://linkedIn.com'
  const image = 'https://imageurl.com'
  const amount = 1.5
  const donationAmt = 0.5
  const comment = 'You are brave, keep it up!'

  beforeEach(async () => {
    ;[deployer, owner, donor1, donor2] = await ethers.getSigners()
    contract = await ethers.deployContract('DappFundX', [taxPct])
    await contract.waitForDeployment()
  })

  describe('Charity', () => {
    beforeEach(async () => {
      await contract
        .connect(owner)
        .createCharity(name, fullname, profile, description, image, toWei(amount))
    })

    describe('Success', () => {
      it('Should confirm charity creation', async () => {
        result = await contract.getCharities()
        expect(result).to.have.lengthOf(1)

        result = await contract.getCharity(id)
        expect(result.name).to.be.equal(name)
        expect(result.description).to.be.equal(description)
      })

      //Charity Update Test
      it('Should confirm charity update', async () => {
        result = await contract.getCharity(id)
        expect(result.name).to.be.equal(name)
        expect(result.amount).to.be.equal(toWei(amount))

        const newName = 'My Second Charity'
        const newAmount = 2.5
        await contract
          .connect(owner)
          .updateCharity(id, newName, fullname, profile, description, image, toWei(newAmount))

        result = await contract.getCharity(id)
        expect(result.name).to.be.equal(newName)
        expect(result.amount).to.be.equal(toWei(newAmount))
      })

      //Charity Deletion Test
      it('Should confirm charity deletion', async () => {
        result = await contract.getCharities()
        expect(result).to.have.lengthOf(1)

        result = await contract.getCharity(id)
        expect(result.deleted).to.be.equal(false)

        await contract.connect(owner).deleteCharity(id)

        result = await contract.getCharities()
        expect(result).to.have.lengthOf(0)

        result = await contract.getCharity(id)
        expect(result.deleted).to.be.equal(true)
      })
    })
  })
})
