const { assert } = require('chai')
const { deployments, ethers, network } = require('hardhat')
const { developmentChains } = require('../../helper-hardhat-config')

developmentChains.includes(network.name)
    ? describe.skip
    : describe('FundMe', async function () {
          let FundMe
          let deployer
          const sendVal = ethers.parseEther('1')

          beforeEach(async function () {
              const accounts = await ethers.getSigners()
              deployer = accounts[0]

              // deployments.get 获取近期的部署
              const FundMeDeployment = await deployments.get('FundMe')
              // 连接到账户，不是地址 所以不是 deployer.address
              FundMe = await ethers.getContractAt(
                  FundMeDeployment.abi,
                  FundMeDeployment.address,
                  deployer
              )
          })
          it('allows people to fund and withdraw', async function () {
              await FundMe.fund({ value: sendVal })
              await FundMe.withdraw()
              const endFundMeBalance = await ethers.provider.getBalance(
                  FundMe.target
              )
              assert.equal(endFundMeBalance.toString(), '0')
          })
      })
