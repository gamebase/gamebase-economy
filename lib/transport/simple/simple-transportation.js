var _ = require('underscore'),
    Transport = require('./transport');

function SimpleTransportation(opts) {
    this.transports = [];
    this.opts = opts || {};
}

/**
  Instructs this module to listen to an economy
 **/
SimpleTransportation.prototype.listenTo = function(economy) {
    this.economy = economy;
    this.economy.on('transport', _.bind(this.transport, this, economy));
}

/**
  Provides a simple transportation phase
 **/
SimpleTransportation.prototype.transport = function(economy) {
    for (var market in economy.markets) {
        
        var suppliers = economy.markets[market];
        
        for (var i = 0; i < suppliers.length; i++) {
            var exporter = suppliers[i];
            if (exporter.outgoing) {                               
                this.transportFrom(exporter);
            }            
        }
    }
    
    // Move the existing transports
    for (var i = 0; i < this.transports.length; i++) {
        this.transports[i].transport();        
    }
}

/**
  Transports goods from the exporter
 **/
SimpleTransportation.prototype.transportFrom = function(exporter) {

    if (!exporter || !exporter.outgoing) return;
    
    var contract = null,
        transporter;

    for (var i = 0; i < exporter.outgoing.length; i++) {
        contract = exporter.outgoing[i];
        if (contract) {
            transporter = new Transport(this.opts.transport);
            transporter.pickup(contract);
            this.transports.push(transporter);
            exporter.outgoing.splice(exporter.outgoing.indexOf(contract), 1);
            
            transporter.on('delivered', _.bind(this.removeTransport, this, transporter));
        }
    }
}

/**
  Removes a transport
 **/
SimpleTransportation.prototype.removeTransport = function(transport) {
    this.transports.splice(this.transports.indexOf(transport), 1);
}

module.exports = SimpleTransportation;
