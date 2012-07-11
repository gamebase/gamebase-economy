/**
  The Account allows for financial functions to be attached to an object
 **/
function Account(options) {
    
    this.available = options.credits || 0;
    this.frozen = 0;
    
    var account = this;
    /**
      Attempts to debit immediately the amount from the available funds
     **/
    this.debit = function(amount) {
        if (account.available < amount) return false;
        account.available = account.available - amount;
        return true;
    };

    /**
      Credits an amount to the account
     **/
    this.credit = function(amount) {
        account.available += amount;
        return true;
    };

    /**
      Attempts to freeze funds from available funds to frozen, meaning that they've
      been earmarked for a purpose
  
      Frozen funds can be spent by .complete(amount) or released back into the available pool
      by .release(amount)
     **/
    this.freeze = function(amount) {
        if (account.debit(amount)) {
            account.frozen += amount;
            return true;
        }
        return false;
    };

    /**
      Completes the spending of frozen funds
     **/
    this.complete = function(amount) {
        if (account.frozen >= amount) {
            account.frozen = account.frozen - amount;
            return true;
        }
        return false;
    };

    /**
      Releases funds back into the available pool
     **/
    this.release = function(amount) {
        if (account.frozen >= amount) {
            return account.credit(amount);
        }
        return false;    
    };
    
    /**
      Returns the account balance
     **/
    this.getBalance = function() {
        return account.available;
    }
    
    // Not sure if making this private is necessary for security or not?
    return {
        credit: this.credit,
        debit: this.debit,
        freeze: this.freeze,
        complete: this.complete,
        release: this.release,
        getBalance: this.getBalance
    };
}

module.exports = Account;
