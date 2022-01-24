const axios = require('axios');
const _ = require('lodash');

class Request {
  constructor(endpointUrl = 'http://localhost:8080') {
    this._client = endpointUrl;
  }

  send(typed, data) {
    return this.__manual({
      method: "POST",
      url: this._client,
      headers: { 'content-type': 'application/json'},
      data:{
        id: 1,
        jsonrpc: "2.0",
        method: typed,
        params: data,
      }
    }, true)
  }

  async __manual (req, time_out = true) {
    // axios config
    let id_time_out;
    return new Promise((resolve, reject) => {
      if(time_out) {
        id_time_out = setTimeout(() => {
          reject(new Error('ECONNABORTED'))
        }, 10000)
      }
      axios(req).then(response => {
        if(time_out) { clearTimeout(id_time_out) }
        /* Successful */
        let result = _.get(response, 'data.result', null)
        if(result != null) {
          resolve(result);
        }
        /* Error */
        let error = _.get(response, 'data.error', null)
        if(error != null) {
          reject(error);
        }
      }).catch((err) => {
        reject(err)
      })

    })
  }
}

module.exports = { Request };