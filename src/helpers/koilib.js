const { Provider, Signer, Serializer, utils } = require('koilib')

const provider = new Provider(process.env.RPC_NODE)
const signer = Signer.fromSeed('seed')

const txSerializer = new Serializer(utils.ProtocolTypes, { defaultTypeName: 'active_transaction_data' });
const blockSerializer = new Serializer(utils.ProtocolTypes, { defaultTypeName: 'active_block_data' });


const blockSigner = (active) => utils.encodeBase58(utils.decodeBase64(active.signer))
const txSigner = (tx) => signer.recoverAddress(tx);


module.exports = {
  provider,
  signer,
  // sings
  blockSigner,
  txSigner,
  // serializers
  txSerializer,
  blockSerializer
}