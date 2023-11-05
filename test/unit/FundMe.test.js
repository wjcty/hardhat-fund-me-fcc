const { assert, expect } = require('chai')
const { deployments, ethers, network } = require('hardhat')
const { developmentChains } = require('../../helper-hardhat-config')
!developmentChains.includes(network.name)
    ? describe.skip
    : describe('FundMe', async function () {
          let FundMe
          let deployer
          let MockV3Aggregator

          const sendVal = ethers.parseEther('1')

          beforeEach(async function () {
              const accounts = await ethers.getSigners()
              deployer = accounts[0]
              await deployments.fixture(['all'])

              const FundMeDeployment = await deployments.get('FundMe')
              // 连接到账户，不是地址 所以不是 deployer.address
              FundMe = await ethers.getContractAt(
                  FundMeDeployment.abi,
                  FundMeDeployment.address,
                  deployer
              )
              const MockV3AggregatorDeployment = await deployments.get(
                  'MockV3Aggregator'
              )
              // 连接到账户，不是地址 所以不是 deployer.address
              MockV3Aggregator = await ethers.getContractAt(
                  MockV3AggregatorDeployment.abi,
                  MockV3AggregatorDeployment.address,
                  deployer
              )
          })

          describe('constructor', async function () {
              it('sets the aggregator address correctly', async function () {
                  const response = await FundMe.getPriceFeed()
                  assert.equal(response, MockV3Aggregator.target)
              })
          })

          describe('fund', async function () {
              it('shall fail if there is no enougn eth', async function () {
                  // revertedWith 报错时会回滚代码
                  await expect(FundMe.fund()).to.be.revertedWith(
                      'you need to spend more eth'
                  )
              })
              it('updated the amount funded data structure', async function () {
                  await FundMe.fund({ value: sendVal })
                  const response = await FundMe.getAddressToAmountFunded(
                      deployer
                  )
                  assert.equal(response.toString(), sendVal.toString())
              })
              it('adds funder to array of getFunders', async function () {
                  await FundMe.fund({ value: sendVal })
                  const funder = await FundMe.getFunders(0)
                  assert.equal(funder, deployer.address)
              })
          })

          describe('withdraw', async function () {
              beforeEach(async function () {
                  await FundMe.fund({ value: sendVal })
              })
              it('withdraw ETH from a single founder', async function () {
                  //arrange 准备测试

                  const startFundMeBalance = await ethers.provider.getBalance(
                      FundMe.target
                  )
                  const startDeployerBalance = await ethers.provider.getBalance(
                      deployer.address
                  )
                  //act 执行测试
                  const transactionResponse = await FundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)

                  const { gasUsed, gasPrice } = transactionReceipt
                  const gasCost = gasUsed * gasPrice

                  const endFundMeBalance = await ethers.provider.getBalance(
                      FundMe.target
                  )
                  const endDeployerBalance = await ethers.provider.getBalance(
                      deployer.address
                  )
                  //assert 断言
                  assert.equal(endFundMeBalance.toString(), '0')
                  assert.equal(
                      startDeployerBalance + startFundMeBalance,
                      endDeployerBalance + gasCost
                  )
              })
              it('allows us to withdraw with multiple getFunders', async function () {
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await FundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendVal })
                  }

                  const startFundMeBalance = await ethers.provider.getBalance(
                      FundMe.target
                  )
                  const startDeployerBalance = await ethers.provider.getBalance(
                      deployer.address
                  )
                  //act 执行测试
                  const transactionResponse = await FundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)

                  const { gasUsed, gasPrice } = transactionReceipt
                  const gasCost = gasUsed * gasPrice

                  const endFundMeBalance = await ethers.provider.getBalance(
                      FundMe.target
                  )
                  const endDeployerBalance = await ethers.provider.getBalance(
                      deployer.address
                  )
                  //assert 断言
                  assert.equal(endFundMeBalance.toString(), '0')
                  assert.equal(
                      startDeployerBalance + startFundMeBalance,
                      endDeployerBalance + gasCost
                  )

                  await expect(FundMe.getFunders(0)).to.be.reverted

                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await FundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
              it('only allows the owner to withdraw', async function () {
                  const accounts = await ethers.getSigners()
                  // 连接到账户，不是地址 所以不是 accounts[1].address
                  const attackerConnectedContract = await FundMe.connect(
                      accounts[1]
                  )
                  await expect(
                      attackerConnectedContract.withdraw()
                  ).to.be.revertedWithCustomError(FundMe, 'FundMe__NotOwner')
              })

              it('cheaperWithdraw testing...', async function () {
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await FundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendVal })
                  }

                  const startFundMeBalance = await ethers.provider.getBalance(
                      FundMe.target
                  )
                  const startDeployerBalance = await ethers.provider.getBalance(
                      deployer.address
                  )
                  //act 执行测试
                  const transactionResponse = await FundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)

                  const { gasUsed, gasPrice } = transactionReceipt
                  const gasCost = gasUsed * gasPrice

                  const endFundMeBalance = await ethers.provider.getBalance(
                      FundMe.target
                  )
                  const endDeployerBalance = await ethers.provider.getBalance(
                      deployer.address
                  )
                  //assert 断言
                  assert.equal(endFundMeBalance.toString(), '0')

                  assert.equal(
                      startDeployerBalance + startFundMeBalance,
                      endDeployerBalance + gasCost
                  )

                  await expect(FundMe.getFunders(0)).to.be.reverted

                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await FundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
          })
      })
