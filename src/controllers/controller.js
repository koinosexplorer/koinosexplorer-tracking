const { signer, txSerializer, blockSerializer } = require('./../helpers/koilib');
const { customAlphabet } = require('nanoid');

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 26);

// helpers
const dot = require('dot-object');

class Controller {
  constructor({ model, knex, prefix }) {
    this.knex = knex;
    this.model = model.bindKnex(this.knex);
    this.prefix = prefix;
  }

  // query db
  singleQuery() {
    return this.model.query();
  }
  relationalQuery(relation) {
    return this.model.relatedQuery(relation);
  }

  // utils
  async getSigner(data) {
    let sing = await signer.recoverAddress(data);
    return sing;
  }
  async getDeSerializeData(block) {
    if(block.active) {
      block.active = await blockSerializer.deserialize(block.active)
    }
    if(block.transactions) {
      let txFinal = []
      for (let index = 0; index < block.transactions.length; index++) {
        let txInblock = block.transactions[index];
        txInblock.active = await txSerializer.deserialize(txInblock.active);
        txFinal.push(txInblock);
      }
      block.transactions = txFinal;
    }
    return block;
  }
  getId() {
    return `${this.prefix}_${nanoid()}`;
  }
  metadata(data) {
    let dot_data = dot.dot(data);
    let process_data = (key) => ({
      id: this.getId(),
      name: key,
      value: dot_data[key]
    })
    return Object.keys(dot_data).map(process_data);
  }
}

module.exports = { Controller }
