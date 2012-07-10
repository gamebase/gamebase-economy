var _ = require('underscore'),
    expect = require('chai').expect,
    Economy = require('../lib/economy'),
    Node = require('../lib/node'),
    Producer = require('../lib/producer'),
    world = new Economy();

describe('test the supply and demand of a simple economy', function() {
    
    before(function(done) {
        
        var planet1 = new Node('planet1', {credits: 500});        
        world.insertNode(planet1);
        
        planet1.addProducer(new Producer({
            name: 'farm',
            produces: {
                commodity: 'wheat',
                quantity: 20,
                productionTime: 20
            }
        }));
        
        planet1.addProducer(new Producer({
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
        
        planet1.exportCommodity('bread', { price: '10', minStock: 10}); 
        
        var planet2 = new Node('planet2', {credits: 500});
        planet1.addProducer(new Producer({
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
        
        world.insertNode(planet2, ['planet1'], 1000);  
        done();
    });

    it('should allow nodes to supply products', function(done) {
        
        setInterval(_.bind(world.tick, world), 500);        
        
    });
    
})