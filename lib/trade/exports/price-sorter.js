/**
  The PriceSorter offers the simplest form of export bid sorting, by being greedy
  and ranking the highest priced bid as the best
 **/
function PriceSorter() {
    
}

/**
  Sorts the bids
 **/
PriceSorter.prototype.sort = function(bids) {
    if (!bids) return bids;
    return bids.sort(function(a,b) {
        return (a.price > b.price) ? -1 : 1;
    });
}

module.exports = PriceSorter;