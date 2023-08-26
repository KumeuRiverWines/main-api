const State = require("./State");

/**
 * Node Class represents a node which has sensors and state
 */
class Node {
    //Constructor
    constructor(id, location, state) { 
        this.id = id;
        this.location = location;
        this.state = null;
        this.lastSeen = null;
        this.updatePayload = [];

        this.updateState(state);
    }

    //Methods
    getUpdateBytes() {
        const delay = this.#calculateDelay();
        const tempPaylod = this.state.getUpdateBytes();
        tempPaylod.unshift(delay);
        return tempPaylod;
    }

    getUpdateInterval() {
        this.state.getUpdateInterval();
    }

    getLastUpdateInterval() {
        this.state.getLastUpdateInterval(); 
    }

    setLastUpdateInterval(interval) {
        this.state.updateLastInterval(interval);
    }

    getId() {
        return this.id;
    }

    getState() {
        return this.state;
    }

    getLocation() {
        return this.location;
    }

    getLastSeen() {
        return this.lastSeen;
    }    

    getDownLinkInfo() {
        return this.state.getUpdateBytes();
    }

    updateLastSeen() {
        this.lastSeen = new Date(); //Will update last seen to current time
    }

    updateLocation(newLocation) {
        this.location = newLocation;
    }

    //Takes in string of state
    updateState(state) {
        this.state = new State(state);
        return this.state;
    }

    #calculateDelay() {
        let timeDelay = 0;
        const date = new Date();
        const intervalTime = this.state.getUpdateInterval();

        const currentTimeMinute = new Date().getMinutes();
        if(date.getSeconds >= 30) {
            currentTimeMinute++; //Rounding down a minute
        }

        let offset = currentTimeMinute % intervalTime;
        if (1 < offset && offset < (intervalTime - 1)) {
            timeDelay = intervalTime - offset;
        }

        return timeDelay % 255; 
    }
}

module.exports = Node;
