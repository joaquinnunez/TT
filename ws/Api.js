const async = require('async')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const Order = require("./Order")

app.use(bodyParser.urlencoded({ extended: true }))

app.put('/order/cancel', (req, res) => {
  res.send('cancel order')
})

app.post('/order', (req, res) => {
  const o = req.body
  console.log('Received an order.')
  console.log(o)
  const markets = app.get('markets')
  const balances = app.get('balances')
  const binance = app.get('binance')
  const openOrders = app.get('openOrders')
  const conf = markets.getInfo(o.pair)

  async.auto({

    price: (callback) => {
      // Unless market
      if (o.type.indexOf('MARKET') !== -1)
        return callback(null)

      // Round by default and check min and max price
      let price = binance.roundStep(parseFloat(o.limit), conf.tickSize)
      if (price < conf.minPrice)
        return callback(`ERR: minPrice is ${conf.minPrice}, input was ${price}`)
      if (price > conf.maxPrice)
        return callback(`ERR: maxPrice is ${conf.maxPrice}, input was ${price}`)

      callback(null, price)
    },
    amount: (callback) => {
      let amount = o.amount

      if (isNaN(o.f) && isNaN(amount))
        return callback('Please specify a fraction of a position or the amount of the order.')

      // Add f parameter, to specify fractions of positions as qty.
      // f=0.5 means, sell half of the position
      if (!isNaN(o.f)) {
        let asset = o.side == 'SELL' ? conf.baseAsset : conf.quoteAsset
        let balance = balances.getAvailable(asset)
        amount = balance * parseFloat(o.f)
      }

      amount = binance.roundStep(parseFloat(amount), conf.stepSize)
      // Check minimum order amount with minQty
      if (amount < conf.minQty)
        return callback(`ERR: minQty is ${conf.minQty}, input was ${amount}`)
      if (amount > conf.maxQty)
        return callback(`ERR: maxQty is ${conf.maxQty}, input was ${amount}`)

      callback(null, amount)
    },
    validOrder: ['price', 'amount', function(order, callback) {
      // Unless market
      // Check minimum order amount with minNotional
      if (o.type.indexOf('MARKET') !== -1)
        return callback(null, { amount: order.amount })

      if (!isNaN(order.price) && !isNaN(order.amount) && order.price * order.amount < conf.minNotional) {
        return callback(`ERR: minNotional is ${conf.minNotional}, input was ${order.price*order.amount}`)
      }

      callback(null, { price: order.price, amount: order.amount })
    }],

    addToOpenOrders: ['validOrder', function(result, callback) {
      let vo = result.validOrder
      let order = new Order(o.pair, o.type, o.side, vo.amount, vo.price, o.stop)
      openOrders.push(order)
      console.log('Order placed.')
      callback(null, order)
    }],
  }, function(err, result) {
      if (err) {
        console.error(err)
        return res.send(`Failed: ${err}`)
      }
      console.log(`Order ${result.addToOpenOrders.toString()} placed`)
      res.send(`Order ${result.addToOpenOrders.toString()} placed`)
  })
})

module.exports = app
