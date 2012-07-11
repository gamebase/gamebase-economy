var GamebaseEconomy = {
    
    Economy: require('./lib/economy'),
    Node: require('./lib/node'),
    production: {
        Producer: require('./lib/producer')
    },
    trade: {
        Importer: require('./lib/importer'),
        Exporter: require('./lib/exporter'),
        imports: {
            WeightedAnalyzer: require('./lib/trade/imports/weighted-analyzer')
        },
        exports: {
            PriceSorter: require('./lib/trade/exports/price-sorter')
        }
    },
    phase: {
        transportation: {
            SimpleTransportation: require('./lib/transport/simple/simple-transportation')
        }
    }    
}

module.exports = GamebaseEconomy;