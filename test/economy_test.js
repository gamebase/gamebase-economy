var _ = require('underscore'),
    expect = require('chai').expect,
    gamebaseEconomy = require('..'),
    exportSorter = new gamebaseEconomy.trade.exports.PriceSorter(),
    importRanker = new gamebaseEconomy.trade.imports.WeightedAnalyzer(50, 50),
    world = new gamebaseEconomy.Economy();

describe('test the supply and demand of a simple economy', function() {
    
    before(function(done) {
        
        var transportation = new gamebaseEconomy.phase.transportation.SimpleTransportation({
            transport: {
                speed: 100
            }
        });        
        transportation.listenTo(world);
        
        var planet1 = new gamebaseEconomy.Node('planet1', {account: {credits: 500}});        
        world.insertNode(planet1);
        
        planet1.addProducer(new gamebaseEconomy.production.Producer({
            name: 'farm',
            produces: {
                commodity: 'wheat',
                quantity: 20,
                productionTime: 20
            }
        }));
        
        planet1.addProducer(new gamebaseEconomy.production.Producer({
            name: 'bakery',
            produces: {
                commodity: 'bread',
                quantity: 100,
                productionTime: 5
            },
            requires: {
                "wheat": 10
            }
        }));
        
        planet1.exportCommodity('bread', { minPrice: 10, minStock: 10, bidSorter: exportSorter});
        planet1.importCommodity('iron', { maxPrice: 200, analyzer: importRanker});
        
        var planet2 = new gamebaseEconomy.Node('planet2', {account: {credits: 5000}});
        planet2.addProducer(new gamebaseEconomy.production.Producer({
            name: 'ironmine',
            produces: {
                commodity: 'iron',
                quantity: 20,
                productionTime: 10
            },
            requires: {
                'bread': 150
            }
        }));
        
        world.insertNode(planet2, [{node: 'planet1', distance: 1000}]);  
        
        planet2.importCommodity('bread', {maxSpend: 200, minimumStock: 150, maxPrice: 15, analyzer: importRanker});
        planet2.exportCommodity('iron', {minPrice: 200, minStock: 5, bidSorter: exportSorter});
        done();
    });

    it('should allow nodes to supply products', function(done) {
        
        setInterval(_.bind(world.tick, world), 500);        
        
    });
    
})