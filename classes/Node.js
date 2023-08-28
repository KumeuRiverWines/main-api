const State = require("./State");
const moment = require("moment");


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
        this.lastUpdateInterval = 15; 

        this.updateState(state);
    }

    //Methods
    getUpdateBytes() {
        const delay = this.#calculateDelay();
        console.log("Delay = " + delay);
        const tempPaylod = this.state.getUpdateBytes();
        tempPaylod.unshift(delay);
        return tempPaylod;
    }

    getUpdateInterval() {
        return this.state.getUpdateInterval();
    }

    getLastUpdateInterval() {
        return this.lastUpdateInterval;
    }

    setLastUpdateInterval(interval) {
        this.lastUpdateInterval = interval;
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
        this.state = new State(state );
        return this.state;
    }

    #calculateDelay() {
        const currentDate = new Date();
        const nowDate = currentDate.getTime();
        console.log("Now = " + currentDate);
        const futureDate = this.#getForwardDate(this.state.getUpdateInterval()).getTime();
        console.log("Future = " + new Date(futureDate));

        const differenceInMilliseconds = futureDate - nowDate;
        const differenceMinuteFactor = 1000 * 60; 

        const difference = Math.floor((differenceInMilliseconds /differenceMinuteFactor)) - this.state.getUpdateInterval();

        console.log("Difference = " + difference);
        if(difference > 1) {
            return difference % this.state.getUpdateInterval();
        }  else {
            return 0;
        }
    }

    #getForwardDate(updateTime, date) {
        const countBackTime = updateTime;

        const momentDate = moment(date);	
        const updatedDate = momentDate.add(countBackTime, "minutes");


        return updatedDate.toDate();
    }   

    toObj() {
        return ({
            id: this.id,
            location: this.location,
            lastSeen: this.lastSeen,
            lastUpdateInterval: this.lastUpdateInterval,
            state: this.getState().toObj()
        });
    }
}

module.exports = Node;
