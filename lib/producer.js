var events = require('events'),
    util = require('util');

/**
  Producers a product, providing the approprite resources exists in the node
 **/
function Producer(options) {
    
    options = options || {};
    this.name = options.name;
    this.requires = options.requires;
    this.produces = options.produces;
    this.productionTime = this.produces.productionTime || 1;
    this.timeProducing = false;
    
}
util.inherits(Producer, events.EventEmitter);

/**
  Tests to see if the parent node has meets all the critieria for production,
  and produces a commodity if it has
 **/
Producer.prototype.produce = function() {
    
    // Production in process
    if (this.timeProducing > 0) {
        
        if (this.timeProducing >= this.productionTime) {
            this.emit('produced', {commodity: this.produces.commodity, quantity: this.produces.quantity || 1});
            this.timeProducing = 0;
        } else {
            this.timeProducing ++;
            return;
        }
    
    } 
    
    // Check to see if production is available
    if (this.meetsRequirements() && this.node.consume(this.requires)) {
        this.timeProducing = 1;
    }
    
}

/**
  Determines whether the producer is capable of producing given the resources
  available on the node, and the requirements of the producer
 **/
Producer.prototype.meetsRequirements = function() {
    if (!this.node) return false;
    if (!this.requires) return true;
    
    for (var commodity in this.requires) {
        if (!this.node.hasAvailable(commodity, this.requires[commodity])) {
            return false;
        }
    }
    
    return true;
}

module.exports = Producer;