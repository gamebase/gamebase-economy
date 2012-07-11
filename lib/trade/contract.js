var events = require('events'),
    util = require('util');

/**
  Contains information about the contract
 **/
function Contract(commodity, quantity, pricePerUnit, exporter, importer, opts) {
    this.commodity = commodity;
    this.quantity = quantity;
    this.pricePerUnit = pricePerUnit;
    this.exporter = exporter;
    this.importer = importer;
    this.opts = opts || {};
    events.EventEmitter.call(this);
}
util.inherits(Contract, events.EventEmitter);

Contract.prototype.paid = function(amount) {
    console.log('paid');
    this.emit('paid', amount);
}

/**
  Indicates that this contract has been fulfilled
 **/
Contract.prototype.fulfill = function() {
    this.importer.fulfill(this);
}

module.exports = Contract;