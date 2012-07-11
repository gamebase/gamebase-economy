var _ = require('underscore'),
    events = require('events'),
    util = require('util'),
    Bid = require('./trade/bid');

/**
  Allows an economy node to import a commodity from an exporter
  
  Options include:
    - Export price
    - Minimum stock level
 **/
function Importer(commodity, options) {
    
    options = options || {};
    this.commodity = commodity;
    this.options = options;
    this.contracts = [];
    this.maxSpend = options.maxSpend || -1;
    events.EventEmitter.call(this);
    
}
util.inherits(Importer, events.EventEmitter);

/**
  Analyzes the available options in the market for the best offer
 **/
Importer.prototype.analyze = function(market) {
    
    if (!market || market.length === 0) {
        return [];
    }
    
    var results = [],
        analyzer = this.options.analyzer,
        maxPrice = this.options.maxPrice || -1,
        suppliers = 0,
        totalDistance = 0,
        totalPrice = 0.0,
        meanDistance = 0,
        meanPrice = 0,      
        distance = null,
        supplier = null,
        info;
        
    if (!analyzer) {
        console.log('No analyzer available for import ranking');
        return [];
    }
        
    // Initial pass - identify valid supplier nodes, calculate distances
    for (var i = 0; i < market.length; i++) {
        supplier = market[i];
        info = supplier.getInfo();
        
        // Check if this supplier gets excluded immediately on price or no stock
        if ((maxPrice >= 0 && info.minPrice > maxPrice) || info.available <= 0) {
            continue;
        }
        
        // Calculate the distance to the supplier
        distance = this.node.distanceTo(supplier.node);
        totalDistance += distance;
        totalPrice += supplier.getMinPrice();
        suppliers++;
        results.push({distance: distance, price: info.minPrice, available: info.available, supplier: supplier});        
    }
    
    if (suppliers == 0) {
        return [];
    }
    // Calculate mean values
    meanDistance = (totalDistance / suppliers);
    meanPrice = (totalPrice / suppliers);
    
    // Calculate the attractiveness of suppliers
    for (var i = 0; i < results.length; i++) {
        var result = results[i];
        result.attractiveness = analyzer.calculate(result.distance, meanDistance, result.price, meanPrice);
    }
    
    // Sort by attractiveness
    results.sort(function(a, b) {
        if (a.attractiveness === b.attractiveness) return 0;
        return (a.attractiveness > b.attractiveness) ? -1 : 1;
    });
    return results;    
}

/**
  Returns the number of commodities on an outstanding contract
 **/
Importer.prototype.getContracted = function() {
    var total = 0;
    _.each(this.contracts, function(contract) {
        total += contract.quantity;
    });
    return total;
}

/**
  Returns the number of imports required
  
  If no limit, return -1 (import as much as is available, with available funds)
  If a minimum stock limit is set, calculate the required import amounts as:
    Minimum stock limit - (Number of inventoried commodity + Number of contracted commodity)
**/
Importer.prototype.getRequiredImports = function() {
    var minimum = this.options.minimumStock || -1,
        required = 0;
    if (minimum <= 0) {
        return minimum;
    }
    required = minimum - (this.node.quantity(this.commodity) + this.getContracted());
    return (required > 0 ? required : 0);
}

/**
  Bids on goods in the marketplace
 **/
Importer.prototype.bid = function(market) {
    var importer = this,
        required = this.getRequiredImports(),
        results = this.analyze(market),
        balance = this.node.account.getBalance(),
        spendable = (this.maxSpend >= 0 && balance >= this.maxSpend) ? this.maxSpend : balance,
        bids = 0;
        
    // Called when a bid is accepted
    function bidAccepted(bid, contract) {
        console.log('Bid accepted');
        importer.node.account.complete(bid.getValue());
        importer.contracts.push(contract);
        contract.paid(bid.getValue());
    };
    
    // Called when a bid is rejected
    function bidRejected(bid) {
        importer.node.account.release(bid.getValue());
    }

    // Iterate through the available markets
    for (var i = 0; i < results.length; i++) {
        
        // No more required, or no cash then exit
        if (required == 0 || spendable <= 0) break;
        
        var exporter = results[i],
            possible = Math.floor(spendable / exporter.price), 
            desired = null,
            bidQuantity = null,
            bid;
        
        if (required >= 0) {
            // Buy as many as is needed
            desired = (required >= possible) ? possible : required;
        } else {
            // Buy as many as is possible
            desired = possible;
        }
        
        bid = new Bid(this, desired, exporter.price, exporter.distance);
        // Make the bid
        if (exporter.supplier.bid(bid)) {
            
            var value = desired * exporter.price;
            // If the bid is registered, freeze the funds
            this.node.account.freeze(value);
            spendable = spendable - value;
            required = required - desired;
            bids++;
            
            bid.on('accepted', bidAccepted);
            bid.on('rejected', bidRejected);
        };                
    }
    
    return bids;
   
}

/**
  Indicates that a contract is fulfilled
 **/
Importer.prototype.fulfill = function(contract) {
    this.emit('imported', contract);
    if (this.contracts.indexOf(contract) >= 0) {
        this.contracts.splice(this.contracts.indexOf(contract), 1);
    }    
}

module.exports = Importer;