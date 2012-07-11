var events = require('events'),
    util = require('util'),
    Contract = require('./trade/contract');

/**
  Allows an economy node to export a commodity and establish contracts
  
  Options include:
    - Export price
    - Minimum stock level
 **/
function Exporter(commodity, options) {
    
    options = options || {};
    this.commodity = commodity;
    this.options = options;
    this.minPrice = options.minPrice || 1;
    this.minStock = options.minStock || 0;
    this.bidSorter = options.bidSorter;
    
    this.bids = [];
    this.outgoing = [];
    events.EventEmitter.call(this);
}
util.inherits(Exporter, events.EventEmitter);

/**
  Gets called by an importer with an offer
  
  Returns true if the bid is registered, returns false if ignored
 **/
Exporter.prototype.bid = function(bid) {
    if (!bid) return false;

    // Check that the bid adheres to the requirements
    if (bid.quantity <= 0) return false;
    if (bid.quantity > this.getAvailableStock()) return false;
    if (bid.price < this.minPrice) return false;
    
    this.bids.push(bid);
    return true;
}

/**
  Resolves any outstanding bids
 **/
Exporter.prototype.resolveBids = function() {
    
    if (!this.bids || this.bids.length == 0) return;
    
    var bids = this.bids;
    if (!this.bidSorter) {
        console.log('No bid sorter available - no bid sorting');
    } else {
        // Sort bids according to a specified sort algorithm
        bids = this.bidSorter.sort(this.bids);
    }
    
    // Process any bids
    for (var i = 0; i < bids.length; i++) {
        var bid = bids[i];
        if (bid.quantity <= this.getAvailableStock()) {
            this.createContract(bid);
            this.node.useCommodity(this.commodity, bid.quantity);
        } else {
            bid.reject();
        }
    }
    
    this.bids = [];
}

/**
  Creates a contract, notifies the importer of their bid success, and arranges for
  transport
 **/
Exporter.prototype.createContract = function(bid) {
    var contract = new Contract(this.commodity, bid.quantity, bid.price, this, bid.importer, {distance: bid.distance}),
        exporter = this;
    contract.on('paid', function(amount) {
        exporter.outgoing.push(contract);
        exporter.node.account.credit(amount);
        console.log('paid ' + amount + ' for ' + bid.quantity + ' ' + exporter.commodity);
    });
    bid.accept(contract);
}

/**
  Returns an object containing the current exporter summary
 **/
Exporter.prototype.getInfo = function() {
    return {
        minPrice: this.minPrice,
        available: this.getAvailableStock()
    };
}

/**
  Returns the min price for goods (importers are free to offer more than this if they desire)
 **/
Exporter.prototype.getMinPrice = function() {
    return this.minPrice;
}

/**
  Returns the amount of stock available for sale
 **/
Exporter.prototype.getAvailableStock = function() {
    var available = this.node.quantity(this.commodity) - this.minStock;
    return (available >= 0) ? available : 0;
}

module.exports = Exporter;