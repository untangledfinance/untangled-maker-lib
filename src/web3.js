const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');

const { MASTER_PRIVATE_KEY, INFURA_HTTP_URL } = process.env;

const provider = new HDWalletProvider({
  privateKeys: [MASTER_PRIVATE_KEY],
  providerOrUrl: INFURA_HTTP_URL,
  addressIndex: 0,
  numberOfAddresses: 1,
});

module.exports = new Web3(provider);
