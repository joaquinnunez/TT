const async = require('async')

const BinanceBalance = (function(binance) {

  let balances = {}

  /**
   * Processes changes in the balance
   */
  function balanceUpdate(data) {
    for (let obj of data.B) {
      let { a:asset, f:available, l:onOrder } = obj
      balances[asset] = {available, onOrder}
    }
  }

  /**
   * Load account balances and opens a socket to keep it updated
   *
   */
  function init() {
    async.auto({
      balances: binance.balance,
      socket: function(callback) {
        binance.websockets.userData(balanceUpdate)
        callback()
      }
    }, function(err, result) {
        if (err) console.error(err)
        else balances = result.balances
    })
  }

  function getAll() {
    return balances
  }

  function getAvailable(asset) {
    return balances[asset].available
  }

  function getOnOrder(asset) {
    return balances[asset].onOrder
  }

  return {
    init,
    getAll,
    getAvailable,
    getOnOrder
  }
})

module.exports = BinanceBalance
