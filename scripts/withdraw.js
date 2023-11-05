const { ethers } = require('hardhat')

async function main() {
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
    console.log('withdrawing...')

    const transactionResponse = await FundMe.withdraw()
    await transactionResponse.wait(1)

    console.log('Got it back!')
}

main()
    .then(() => {
        process.exit(0)
    })
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
