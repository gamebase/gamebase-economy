/**
  The Weighted Analyzer analyzes the available options and returns a value indicating
  how preferred the option is
  
  The analyzer will get four parameters, which can be weighted:
    - The distance
    - The mean distance from all the analyzed options
    - The price
    - The mean price from all the analyzed options
    
  As such, a weighted analysis might be such that distance from the mean distance, and price from the mean price are weighted equally.
  The weighing algorithm looks like this:
  
  (meanDistance - distance) * distanceWeighting + (meanPrice - price) * priceWeighting = attractiveness rating
  
  Assuming the weightings are always positive, the higher the score, the more attractive the rating    
 **/
function WeightedAnalyzer(distanceWeighting, priceWeighting) {
    
    this.distanceWeighting = distanceWeighting;
    this.priceWeighting = priceWeighting;
    
}

/**
  Calculates the attractiveness
 **/
WeightedAnalyzer.prototype.calculate = function(distance, meanDistance, price, meanPrice) {
    return (meanDistance - distance) * this.distanceWeighting + (meanPrice - price) * this.priceWeighting;
}

module.exports = WeightedAnalyzer;