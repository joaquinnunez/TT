// type: limit / market / stop limit / stop market / take profit limit / take profit market
//       * not implemented yet -> hidden, iceberg, Trigger-at-time
// side: BUY / SELL
// time in force: Fill-or-Kill, Good-Til-Canceled, Immediate-or-Cancel

// triggered / untriggered / partially filled / filled / canceled, opened, rejected
// show filled/remaining if partially filled

// validate min order size, order steps
const uuid = require('uuid')
const OrderTypes = {
  'LIMIT': 'LIMIT',
  'MARKET': 'MARKET',
  'LIMIT_MAKER': 'LIMIT',
  'STOP_LOSS_LIMIT': 'LIMIT',
  'TAKE_PROFIT_LIMIT': 'LIMIT',
  'STOP_LOSS_MARKET': 'MARKET',
  'TAKE_PROFIT_MARKET': 'MARKET',
}

const TAKE_PROFITS = ['TAKE_PROFIT_LIMIT', 'TAKE_PROFIT_MARKET']
const STOPS = ['STOP_LOSS_LIMIT', 'STOP_LOSS_MARKET']
const IMMEDIATE = ['LIMIT', 'MARKET', 'LIMIT_MAKER']



class Order {
  constructor (pair, type, side, amount, limit = null, stop = null) {
    this.pair = pair
    this.type = type
    this.side = side
    this.amount = amount
    this.limit = limit
    this.stop = parseFloat(stop) // be careful
    this.uuid = uuid.v4()
  }

  toString () {
    return `${this.uuid} ${this.pair} ${this.type} ${this.side} Amount> ${this.amount}, Price> ${this.limit}, Stop> ${this.stop}`
  }

  // should use inheritance?
  test (c) {

    // LIMIT
    // MARKET
    // STOP_LOSS
    // STOP_LOSS_LIMIT
    // TAKE_PROFIT
    // TAKE_PROFIT_LIMIT
    // LIMIT_MAKER

    // Other info:
    // 
    // LIMIT_MAKER are LIMIT orders that will be rejected if they would immediately match and trade as a taker.
    // STOP_LOSS and TAKE_PROFIT will execute a MARKET order when the stopPrice is reached.
    // Any LIMIT or LIMIT_MAKER type order can be made an iceberg order by sending an icebergQty.
    // Any order with an icebergQty MUST have timeInForce set to GTC.
    // Trigger order price rules against market price for both MARKET and LIMIT versions:
    // 
    // Price above market price: STOP_LOSS BUY, TAKE_PROFIT SELL
    // Price below market price: STOP_LOSS SELL, TAKE_PROFIT BUY

    if (IMMEDIATE.indexOf(this.type) !== -1) {
      return true
    }

    // LONG POSITIONS
    //stop loss sell if close <= stop, trigger limit
    if (STOPS.indexOf(this.type) !== -1 && this.side == 'SELL' && c <= this.stop) {
      return true
    }

    //take profits sell if close >= stop, trigger limit
    if (TAKES_PROFITS.indexOf(this.type) !== -1 && this.side == 'SELL' && c >= this.stop) {
      return true
    }

    // SHORT POSITIONS
    //stop loss buy if close >= stop, trigger limit
    if (STOPS.indexOf(this.type) !== -1 && this.side == 'BUY' && c >= this.stop) {
      return true
    }

    //take profits buy if close < stop, trigger limit
    if (TAKES_PROFITS.indexOf(this.type) !== -1 && this.side == 'BUY' && c <= this.stop) {
      return true
    }

    return false
  }

  t () {
    let side = this.side
    let symbol = this.pair
    let type = this.type
    let quantity = this.amount
    let price = this.limit
    let flags = {}
    if (OrderTypes[type] == 'MARKET')
      flags.type = 'MARKET'
    return { side, symbol, quantity, price, flags }
  }

}

module.exports = Order
