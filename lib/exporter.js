var events = require('events'),
    util = require('util');

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
    
}
util.inherits(Exporter, events.EventEmitter);

module.exports = Exporter;