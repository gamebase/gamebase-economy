var _ = require('underscore'),
    sys = require('sys'),
    ng = require('node-graph'),
    events = require('events'),
    util = require('util');

/**
  The Economy describes the simulated economy world
 **/
function Economy(config) {    
    this.markets = {};
    this.graph = new ng.Graph();
}
util.inherits(Economy, events.EventEmitter);

/**
  Adds a node (vertex) into the world graph
 **/
Economy.prototype.insertNode = function(node, connectsTo, distance) {
    
    this.graph.addVertex(node);
    
    if (connectsTo) {
        
        for (var i = 0; i < connectsTo.length; i++) {
            var neighbour = connectsTo[i],
                neighbourId = (typeof neighbour == 'string' ? neighbour : neighbour.label),
                edge = new ng.Edge(node.label, neighbourId, {distance: distance});
            
            this.graph.addEdge(edge);
        }
    }
    
    node.on('exporter.add', _.bind(this.registerExporter, this, node));
    node.on('exporter.remove', _.bind(this.removeExporter, this, node));
}

/**
  Registers an exporter in the markets
 **/
Economy.prototype.registerExporter = function(node, exporter, options) {
    if (!exporter || !node) return;
    
    var market = this.markets[exporter.commodity] || [];
    if (market.indexOf(node) == -1) {
        market.push(exporter);    
        this.markets[exporter.commodity] = market;        
    }    
}

/**
  Removes an exporter node from the commodity marketplace
 **/
Economy.prototype.removeExporter = function(node, commidity) {    
    
    if (!this.markets[commodity]) return;
    
    var location = this.markets[commodity].indexOf(node);
        
    if (location != -1) {
        this.markets[commodity].splice(location, 1);
    }
}


/**
  Executes an economy time interval action (representing the passing of one time period)
 **/
Economy.prototype.tick = function() {
    
    var vertices = this.graph.vertices;
    
    // Produce phase
    for (var vertex in vertices) {
        vertices[vertex].produce();
    }
    
    // Trade Phase
    this.trade();
    
    // Transport phase
    this.emit('transport');
}

/**
  Attempts to establish contracts between importers and exporters for their goods
 **/
Economy.prototype.trade = function() {

    var bidsInRound = 0,
        round = 0;

    // Keep bidding until all bids are resolved
    while (bidsInRound > 0 || round == 0) {
        bidsInRound = 0;
        // Allow each of the planets to bid for goods
        for (var vertex in this.graph.vertices) {        
            bidsInRound += this.graph.vertices[vertex].bidForImports(this.markets);        
        }
        
        // Resolve the bids on the exporters side
        for (var market in this.markets) {
            var suppliers = this.markets[market];
            for (var i = 0; i < suppliers.length; i++) {
                suppliers[i].resolveBids();
            }
        }
        round++;    
    }    
}

module.exports = Economy;