const async = require('async')

const BinanceMarkets = (function(binance) {

  let markets = {}

  /**
   * Load markets conf
   *
   */
  function init() {

    async.auto({
      exchangeInfo: binance.exchangeInfo,
      conf: ['exchangeInfo', function(result, callback) {
        console.log('Getting Markets information')
        for (let s of result.exchangeInfo.symbols) {
          let { baseAsset, quoteAsset, filters } = s
          let { minPrice, maxPrice, tickSize } = filters.find(f=>f.filterType=='PRICE_FILTER')
          let { minQty, maxQty, stepSize } = filters.find(f=>f.filterType=='LOT_SIZE')
          let { minNotional } = filters.find(f=>f.filterType=='MIN_NOTIONAL')
          markets[s.symbol] = {baseAsset, quoteAsset, minPrice, maxPrice, tickSize, minQty, maxQty, stepSize, minNotional }
        }
      }],
    }, function(err, result) {
        if (err) console.error(err)
        else console.log('Market conf ready.')
    })
  }

  function getAll() {
    return markets
  }

  function getInfo(asset) {
    return markets[asset]
  }

  return {
    init,
    getAll,
    getInfo
  }
})

module.exports = BinanceMarkets
