const axios = require('axios');
const { get: _get } = require('lodash');

class Request {
  constructor(endpointUrl = [ 'http://localhost:8080' ]) {
    this._list = endpointUrl;
    this._client = endpointUrl[0];
  }

  send(typed, data, intents = 0) {
    let request = {
      method: "POST",
      url: this._client,
      headers: { 'content-type': 'application/json'},
      data:{
        id: 1,
        jsonrpc: "2.0",
        method: typed,
        params: data,
      }
    }
    let result
    try {      
      result = this.__manual(request, true)
    } catch (error) {
      if(intents >= this._list.length ) {
        return error;
      }
      this.nodeUpdate()
      return this.send(typed, data, intents + 1)
    }
    return result;
  }

  nodeUpdate() {
    let index = this._list.indexOf(this._client)
    if(index == this._list.length - 1) {
      this._client = this._list[0];
    } else {
      this._client = this._list[index + 1];
    }
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
        let result = _get(response, 'data.result', null)
        if(result != null) {
          resolve(result);
        }
        /* Error */
        let error = _get(response, 'data.error', null)
        if(error != null) {
          reject(error);
        }
      }).catch((err) => {
        reject(err)
      })

    })
  }  
}

module.exports = { Request }