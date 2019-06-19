const async = require('async')
const Api = require("./Api")
const BinanceBalance = require("./BinanceBalances")
const BinanceMarkets = require("./BinanceMarkets")
const BinanceOrders = require("./BinanceOrders")

const binance = require('node-binance-api')().options({
  APIKEY: process.env.APIKEY,
  APISECRET: process.env.APISECRET,
  useServerTime: true, // If you get timestamp errors, synchronize to server time at startup
  test: false // If you want to use sandbox mode where orders are simulated
})
const OpenOrders = require("./OpenOrders")
const openOrders = new OpenOrders()

const Balances = BinanceBalance(binance)
Balances.init()
const Markets = BinanceMarkets(binance)
Markets.init()
const Orders = BinanceOrders(binance)
Orders.init()

// ---*---
const now = () => new Date().toISOString()

binance.websockets.candlesticks(['BTCUSDT', 'LTCUSDT', 'BNBUSDT', 'ETHUSDT'], "1m", (candlesticks) => {
  let { e:eventType, E:eventTime, s:symbol, k:ticks } = candlesticks
  let { o:open, h:high, l:low, c:close, v:volume, n:trades, i:interval, x:isFinal, q:quoteVolume, V:buyVolume, Q:quoteBuyVolume } = ticks
  let { baseAsset, quoteAsset } = Markets.getInfo(symbol) || {}
  console.log(`${symbol} Balance> ${baseAsset}: ${Balances.getAvailable(baseAsset)} ${quoteAsset}: ${Balances.getAvailable(quoteAsset)} Close> ${close}`)
  let pairOpenOrders = openOrders.getOrdersFor(symbol)
  for (let i = 0; i < pairOpenOrders.length; i++) {
    let o = pairOpenOrders[i]
    let c = parseFloat(close)
    let shouldExecute = o.test(c)
    if (shouldExecute) {
      Orders.send(o)
      openOrders.removeOrder(o)
    }
  }
})
// ---*---
Api.listen(7000, () => console.log(`API ready.`))
Api.set('binance', binance)
Api.set('openOrders', openOrders)
Api.set('balances', Balances)
Api.set('markets', Markets)
// ---*---
