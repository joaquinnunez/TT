class OpenOrders {

  constructor () {
    this.orders = {}
  }

  push (o) {
    if (o.pair in this.orders) {
      this.orders[o.pair].push(o)
    } else {
      this.orders[o.pair] = [o]
    }
  }

  getOrdersFor (pair) {
    return this.orders.hasOwnProperty(pair) ? this.orders[pair] : []
  }

  removeOrder (o) {
    if (this.orders.hasOwnProperty(o.pair))
      this.orders[o.pair] = this.orders[o.pair].filter((co)=>co.uuid!==o.uuid)
  }

}

module.exports = OpenOrders
