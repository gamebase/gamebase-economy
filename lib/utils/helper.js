
function Helper() {

    var helper = this;
        
    /**
      Returns the first object which has matching properties
     **/
    this.getMatching = function(array, object) {
        if (!array || !object || array.length === 0) return null;

        for (var i = 0; i < array.length; i++) {
            var obj = array[i],
                valid = true;
            if (!obj) continue;
            for (var property in object) {
                if (!obj[property] || obj[property] !== object[property]) {
                    valid = false;
                    break;
                }
            }
            if (valid) return obj;
        }

        return null;    
    };
    
    /**
      Checks to see if any object in the array matches the properties
      of the object provided
     **/
    this.existsIn = function(array, object) {
        
        var matching = helper.getMatching(array, object);
        return (matching ? true : false);
    };
    
    return {
        getMatching: this.getMatching,
        existsIn: this.existsIn
    };
}

module.exports = Helper();    