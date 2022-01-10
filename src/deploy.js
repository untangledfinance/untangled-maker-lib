require('dotenv').config();
const compiledLib = require('./build/MakerLib.json');
const web3 = require('./web3');

const deploy = async () => {
  const [from] = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account', from);

  const result = await new web3.eth.Contract(compiledLib.abi)
    .deploy({ data: '0x' + compiledLib.evm.bytecode.object, arguments: [] })
    .send({ from });

  console.log('Contract deployed to', result.options.address);
};
deploy().finally(() => web3.currentProvider.engine.stop());
