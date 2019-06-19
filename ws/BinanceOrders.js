const async = require('async')

const BinanceOrders = (function(binance) {

  let queue = null

  function init() {

    queue = async.queue(function(o, callback) {
        let { side, symbol, quantity, price, flags } = o.t()
        console.log(side, symbol, quantity, price, flags)
        binance.order(side, symbol, quantity, price, flags, (err, result) => {
          if (err) console.error(err.body)
          else console.log(result)
        })
        setTimeout(() => callback(null), 200) // delay before order
    }, 1)

    queue.drain = function() {
      console.log('All orders have been processed')
    }

  }

  function send(o) {
    queue.push(o)
  }

  return {
    send
  }
})

module.exports = BinanceOrders
