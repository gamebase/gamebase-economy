var _ = require('underscore'),
    events = require('events'),
    util = require('util'),
    ng = require('node-graph'),
    Exporter = require('./exporter');

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
    this.credits = config.credits || 0;
}
util.inherits(Node, ng.Vertex);
util.inherits(Node, events.EventEmitter);

Node.prototype.produce = function() {
    
    console.log(this.commodities);
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
}

Node.prototype.demand = function() {
    
}

Node.prototype.consume = function(resources) {
    if (!resources) return true;
    for (var resource in resources) {
        this._consumeCommodity(resource, resources[resource]);
    }
    return true;
}

Node.prototype._consumeCommodity = function(commodity, amount) {
    if (!commodity || amount < 0) return false;
    var available = this.commodities[commodity];
    if (!available || available < amount) return false;
    
    this.commodities[commodity] = this.commodities[commodity] - amount;
    return true;
}

Node.prototype.hasAvailable = function(commodity, amount) {
    return this.commodities[commodity] && this.commodities[commodity] >= amount;
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

Node.prototype.isExporting = function(commodity) {
    
    if (this.exporters.length <= 0) return false;
    
    for (var i = 0; i < this.exporters.length; i++) {
        if (this.exporters[i].commodity === commodity) return true;
    }
    return false;
    
}

module.exports = Node;