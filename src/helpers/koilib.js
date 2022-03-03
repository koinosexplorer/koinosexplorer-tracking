const { Provider, Signer, Serializer, utils } = require('koilib')

const provider = new Provider(process.env.RPC_NODE)
const signer = Signer.fromSeed('seed')

const txSerializer = new Serializer(utils.ProtocolTypes, { defaultTypeName: 'active_transaction_data' });
const blockSerializer = new Serializer(utils.ProtocolTypes, { defaultTypeName: 'active_block_data' });

module.exports = {
  provider,
  signer,
  // serializers
  txSerializer,
  blockSerializer
}