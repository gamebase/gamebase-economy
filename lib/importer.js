var events = require('events'),
    util = require('util');

/**
  Allows an economy node to import a commodity from an exporter
  
  Options include:
    - Export price
    - Minimum stock level
 **/
function Exporter(commodity, options) {
    
    options = options || {};
    this.commodity = commodity;
    this.options = options;
    
}
util.inherits(Exporter, events.EventEmitter);

Exporter.prototype.sell = function(amount) {
    
}

module.exports = Exporter;