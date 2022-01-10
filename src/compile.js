const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');
const util = require('util');
fs.readFile = util.promisify(fs.readFile);
fs.outputJSON = util.promisify(fs.outputJSON);

const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);

const contractsFolder = path.resolve(__dirname, 'contracts');
const allContractFiles = fs.readdirSync(contractsFolder);

async function compile() {
  let sources = await Promise.all(
    allContractFiles.map(async contractFile => {
      const contractPath = path.resolve(contractsFolder, contractFile);
      const source = await fs.readFile(contractPath, 'utf8');
      return { [contractFile]: { content: source } };
    })
  );
  sources = sources.reduce((all, source) => ({ ...all, ...source }), {});
  const input = {
    language: 'Solidity',
    sources,
    settings: {
      outputSelection: {
        '*': {
          MakerLib: ['abi', 'evm.bytecode.object'],
          '*': ['abi'],
        },
      },
    },
  };
  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  fs.ensureDirSync(buildPath);

  await Promise.all(
    allContractFiles.map(contractFile => {
      const contracts = output.contracts[contractFile];
      return Promise.all(
        Object.keys(contracts).map(contract =>
          fs.outputJSON(path.resolve(buildPath, contract + '.json'), contracts[contract])
        )
      );
    })
  );
}

compile();
