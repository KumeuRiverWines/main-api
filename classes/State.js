//Class the represents the state that a node can be in
class State {
    //Constructor takes in a string for the state that is wanted
    //If string is empty then just defaults to standard state
    constructor(state) {
        this.mode = state; //Setting the mode
        this.lastInterval = -1; //Old Interval that node will be running on
        this.sensorState = [];
        

        this.updateInterval = -1; //Interval which will be sent to node
        this.updateBytes = [];
        this.setSensorState(state);
    }

    getUpdateBytes() {
        return this.updateBytes
    }

    getUpdateInterval() {
        return this.updateInterval;
    }

    getLastUpdateInterval() {
        return this.lastInterval;
    }

    updateLastInterval(update) {
        this.lastInterval  = update;
    }

    setSensorState(state) {
        switch (state) {
            case "Turbo":
                console.log("Turbo mode");
                this.updateInterval = 5; 
                this.sensorState = [(new Sensor(0, "Temperature", 1, 5)), (new Sensor(1, "Humidity", 1, 5))];
                break;
            case "Low Power":
                console.log("Low Power");
                this.updateInterval = 60;
                this.sensorState = [
                    (new Sensor(0, "temperature", 20, 3)),
                    (new Sensor(1, "humidity", 20, 3)),
                    (new Sensor(2, "windDirection", 20, 3)),
                    (new Sensor(3, "windSpeed", 20, 3)),
                    (new Sensor(4, "leafWetness", 20, 3)),
                    (new Sensor(5, "rainCollector", 20, 3))
                ];
                break;
            case "Standard":
            default:
                console.log("Standard");
                this.updateInterval = 15;
                this.sensorState = [
                    (new Sensor(0, "temperature", 5, 3)),
                    (new Sensor(1, "humidity", 5, 3)),
                    (new Sensor(2, "windDirection", 5, 3)),
                    (new Sensor(3, "windSpeed", 5, 3)),
                    (new Sensor(4, "leafWetness", 5, 3)),
                    (new Sensor(5, "rainCollector", 5, 3))
                ];
                break;
        }
        
        //Setting last interval if not set
        if(this.lastInterval === -1) {
            this.lastInterval = this.updateInterval;
        }

        this.#setUpdateBytes();
        return this.sensorState;
    }

    #setUpdateBytes() {
        //Looks at sensorState array and updateInterval and create a updateBytes 
        const tempBytes = [];
  
        //Getting the packet type
		let packetType = 0;
        const sensors = this.sensorState;
		for(const index in sensors) {
            packetType = (packetType | (1 << sensors[index].key));
		}
		packetType = (packetType | (1 << 6)); //setting the send delay bit
          
        //Adding packetType to bytes
        tempBytes.push(packetType);
        console.log(packetType);

        //Updating the payload with the information 
        //Serting the array
        function compare(obj1, obj2) {
            return obj1.getKey() < obj2.getKey();
        }
        sensors.sort(compare);
        console.log(sensors);

        //Looping through and adding the count and delay
        for(const index in sensors) {
            if(sensors[index].getCount() && sensors[index].getDelay()) {
                tempBytes.push(sensors[index].getDelay());
                tempBytes.push(sensors[index].getCount());
            } else {
                console.log("ERROR");
            }
        }
        tempBytes.push(this.updateInterval);//Adding send delay

        this.updateBytes = tempBytes; 
        console.log(this.updateBytes);
    }

    toObj() {
        return ({
            mode: this.mode,
            nextDownlinkTime: this.updateInterval,
        });
    }
}


//Class that represents a sensor
class Sensor {
    constructor(key, name, delay, count) {
        this.key = key;
        this.name = name;
        this.delay = delay;
        this.count = count;
    }

    getObj() {
        return ({
            key: this.key,
            name: this.name,
            delay: this.delay,
            count: this.count
        });
    }

    getKey() {
        return this.key;
    }

    getName() {
        return this.name;
    }

    getDelay() {
        return this.delay;
    }

    getCount() {
        return this.count;
    }
}


module.exports = State;