require('@nomicfoundation/hardhat-toolbox')
require('dotenv').config()
require('hardhat-deploy')
require('hardhat-gas-reporter')

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || ''
const PRIVATE_KEY = process.env.PRIVATE_KEY || ''
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ''
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || ''

module.exports = {
    defaultNetwork: 'hardhat',
    networks: {
        goerli: {
            url: GOERLI_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 5,
            // 等待几个区块确认
            blockConfirmations: 6
        },
        localhost: {
            url: 'http://127.0.0.1:8545/',
            // accounts hardhat提供
            chainId: 31337
        }
    },
    solidity: {
        compilers: [
            {
                version: '0.8.8'
            },
            {
                version: '0.6.6'
            }
        ]
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY
    },
    gasReporter: {
        enabled: true,
        outputFile: 'gas-report.txt',
        noColors: true,
        currency: 'USD'
        // coinmarketcap: COINMARKETCAP_API_KEY
    },
    namedAccounts: {
        deployer: {
            default: 0
            // 链ID：第几个账户作为deployer
            // 5:1 => goerli  1
            // 31337:2 => hardhat 2
        },
        user: {
            default: 1
        }
    }
}
