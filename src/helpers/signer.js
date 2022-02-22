const { Serializer, utils, Signer } = require("koilib");

// Serialize data
const activeBlockDataSerializer = new Serializer(utils.ProtocolTypes, { defaultTypeName: 'active_block_data' })

/**
 * Functions
 */
const recoverBlock = async (active) => {
  let activeSigner = await activeBlockDataSerializer.deserialize(active)
  return utils.encodeBase58(utils.decodeBase64(activeSigner.signer));
}

const recoverTx = async (tx) => {
  return await Signer.recoverAddress(tx)
}

module.exports = {
  recoverBlock,
  recoverTx
}