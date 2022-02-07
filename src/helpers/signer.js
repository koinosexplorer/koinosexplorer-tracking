const koilib = require("koilib");
const bs58 = require("bs58")

const recover = async (data) => {
  const hex_data = await koilib.Signer.recoverPublicKey(data);
  const bytes = Buffer.from(hex_data, 'hex')
  const pk = bs58.encode(bytes)
  return pk
}

module.exports = {
  recover
}