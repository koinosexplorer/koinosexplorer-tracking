const { Provider, Signer, Serializer, utils, Contract } = require('koilib')
const _ = require('lodash');

const provider = new Provider(process.env.RPC_NODE.split(','))
const signer = Signer.fromSeed('seed')

const txSerializer = new Serializer(utils.ProtocolTypes, { defaultTypeName: 'active_transaction_data' });
const blockSerializer = new Serializer(utils.ProtocolTypes, { defaultTypeName: 'active_block_data' });


const blockSigner = (active) => utils.encodeBase58(utils.decodeBase64(active.signer))
const txSigner = (tx) => signer.recoverAddress(tx);

const getTokenInformation = async (contractId) => {
  let nodos = process.env.RPC_NODE.split(',');
  let providerToken = new Provider(nodos)
  providerToken.onError = (error, node, newNode) => {
    const abort = _.last(nodos) == node;
    return abort;
  }
  let token = new Contract({ id: contractId, abi: utils.Krc20Abi, provider: providerToken, signer });
  try {
    const { result: { value: name } } = await token.functions.name();
    const { result: { value: symbol } } = await token.functions.symbol();
    const { result: { value: decimals } } = await token.functions.decimals();
    return { name, symbol, decimals }
  } catch (error) {
    return undefined;
  }
}


module.exports = {
  provider,
  signer,
  getTokenInformation,
  // sings
  blockSigner,
  txSigner,
  // serializers
  txSerializer,
  blockSerializer
}