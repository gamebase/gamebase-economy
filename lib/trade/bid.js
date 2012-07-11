var events = require('events'),
    util = require('util');

function Bid(importer, quantity, pricePerUnit, distance) {    
    this.importer = importer;
    this.quantity = quantity;
    this.price = pricePerUnit;
    this.distance = distance;    
    events.EventEmitter.call(this);
}
util.inherits(Bid, events.EventEmitter);

/**
  Accepts the bid
 **/
Bid.prototype.accept = function(contract) {
    this.emit('accepted', this, contract);
}

/**
  Rejects the bid
 **/
Bid.prototype.reject = function() {
    this.emit('rejected', this);
}

/**
  Returns the value of the bid
 **/
Bid.prototype.getValue = function() {
    return this.price * this.quantity;
}

module.exports = Bid;