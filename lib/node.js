var _ = require('underscore'),
    events = require('events'),
    util = require('util'),
    ng = require('node-graph'),
    Helper = require('./utils/helper'),
    Exporter = require('./exporter'),
    Importer = require('./importer'),
    Account = require('./financial/account');

/**
  An economy node
 **/
function Node(id, config) {
    ng.Vertex.call(this, id);
    events.EventEmitter.call(this);
    config = config || {};
    this.producers = [];
    this.exporters = [];
    this.importers = [];
    this.commodities = {};
    this.account = new Account(config.account);
}
util.inherits(Node, ng.Vertex);
util.inherits(Node, events.EventEmitter);

Node.prototype.produce = function() {
    
    for (var i = 0; i < this.producers.length; i++) {
        this.producers[i].produce();
    }

}

/**
  Indicates that this node should export a commodity
 **/
Node.prototype.exportCommodity = function(commodity, options) {
    
    if (this.isExporting(commodity)) return true;
    
    var exporter = new Exporter(commodity, options);
    this.exporters.push(exporter);
    exporter.node = this;
    this.emit('exporter.add', exporter);    
}

/**
  Indicates that this node should attempt to import a commodity
 **/
Node.prototype.importCommodity = function(commodity, options) {
    
    if (this.isImporting(commodity)) return true;
    
    var importer = new Importer(commodity, options);
    importer.node = this;
    this.importers.push(importer);
    importer.on('imported', _.bind(this.onImport, this));
    
}

Node.prototype.demand = function() {
    
}

Node.prototype.consume = function(resources) {
    if (!resources) return true;
    for (var resource in resources) {
        this.useCommodity(resource, resources[resource]);
    }
    return true;
}

Node.prototype.useCommodity = function(commodity, amount) {
    if (!commodity || amount < 0) return false;
    var available = this.commodities[commodity];
    if (!available || available < amount) return false;
    
    this.commodities[commodity] = this.commodities[commodity] - amount;
    return true;
} 

Node.prototype.hasAvailable = function(commodity, amount) {
    return this.commodities[commodity] && this.commodities[commodity] >= amount;
}

Node.prototype.quantity = function(commodity) {
    return this.commodities[commodity] || 0;
}

Node.prototype.addProducer = function(producer) {
    producer.node = this;
    this.producers.push(producer);
    producer.on('produced', _.bind(this.onProduce, this));
}

Node.prototype.onProduce = function(options) {
    if (!options) return;
    console.log("produced " + options.commodity);
    var commodity = this.commodities[options.commodity] || 0;    
    commodity += options.quantity;
    this.commodities[options.commodity] = commodity;
}

Node.prototype.onImport = function(contract) {
    if (!contract) return;
    console.log("imported " + contract.commodity);
    var commodity = this.commodities[contract.commodity] || 0;    
    commodity += contract.quantity;
    this.commodities[contract.commodity] = commodity;
}

/**
  Checks if a given commodity is being imported
 **/
Node.prototype.isExporting = function(commodity) {
    return Helper.existsIn(this.exporters, {commodity: commodity});
}

/**
  Checks if a given commodity is being imported
 **/
Node.prototype.isImporting = function(commodity) {
    return Helper.existsIn(this.importers, {commodity: commodity});    
}

/**
  Returns the exporter for the given commodity, or null
 **/
Node.prototype.getExporter = function(commodity) {
    return Helper.getMatching(this.importers, {commodity: commodity});
}

/**
  Attempts to import any required commodities by allowing importers
  to bid on goods in the supplied markets
  
  Will return the number of bids made by the importers
 **/
Node.prototype.bidForImports = function(markets) {
    
    var importer = null,
        bids = 0;

    for (var i = 0; i < this.importers.length; i++) {
        importer = this.importers[i];
        bids += importer.bid(markets[importer.commodity]);
        
    }
    
    return bids;
}

/**
  Instructs the node to freeze some credits
 **/
Node.prototype.freezeFunds = function(amount) {
    if (amount > this.credits.available) return false;
    this.credits.frozen += amount;
    this.credits.available = this.credits.available - amount;
    return true;
}

// Dodgy!
Node.prototype.distanceTo = function(node) {
    return 1000;
}

module.exports = Node;