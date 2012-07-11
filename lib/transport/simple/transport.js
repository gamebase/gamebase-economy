var events = require('events'),
    util = require('util');

function Transport(options) {
    this.speed = options.speed || 1;
    this.contract = null;
    this.distance = null;
}
util.inherits(Transport, events.EventEmitter);

/**
  Picks up a contract
 **/
Transport.prototype.pickup = function(contract) {
    this.contract = contract;
    this.distance = contract.opts.distance || 1;
}

/**
  Transports the cargo towards the destination
 **/
Transport.prototype.transport = function() {
    this.distance = this.distance - this.speed;
    if (this.distance <= 0) {
        this.contract.fulfill();
        this.emit('delivered', this);
    }
}

module.exports = Transport;