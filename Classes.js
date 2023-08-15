
class Node {
	//Constant fields
	static MAX_VALUE_COUNT = 12;
	static MIN_VALUE_COUNT = 0;

	static MIN_SEND_DELAY = 1;
	static MAX_SEND_DELAY = 240 //Minutes EG 4 hours


	constructor(deviceId) {
		this.id = deviceId;

		//Snesors active
		this.sensorMap = { }; //JSON object for holding all the sensors

		this.sensorMap["temperature"] = new Sensor("temperature", 0);
		this.sensorMap["humidity"] = new Sensor("humidity", 1):
		this.sensorMap["Wind Direction"] = new Sensor("Wind Direction", 2);
		this.sensorMap["Wind Speed"] = new Sensor("Wind Speed", 3);
		this.sensorMap["Leaf Wetness"] = new Sensor("Leaf Wetness", 4);
		this.sensorMap["Rain Fall"] = new Sensor("Rain Fall", 5);

		this.packetDataCount = 0;		
		this.sendDelay = 1; //Default is 1 minute send
	}

	//Update Delay on a sensor
	//Will enable sensor
	updateSensorState(sensorName, count, delay) {
		//Doing pre data checks

		//Checking ocunt
		if(count >= MAX_VALUE_COUNT || (count + (this.packetDataCount - this.sensorMap[sensorName].getCount())) >= MAX_VALUE_COUNT) {
			return false; //Cannot perform update
		}

		//Checking delay
		//DELAY * COUNT because this will see if we are collecting too much data
		if((delay < MIN_SEND_DELAY || delay > MAX_SEND_DELAY) || (delay * count)  > this.sendDelay) {
			return false;
		}




		this.sensorMap[sensorName].setActive(true); //Enableing the sensor

		//

		this.sensorMap[sensorName].updateCount(		
	}


	//Will disable sensor
	disableSensor(sensorName) {
		this.sensorMap[sensorName].setActive(false);
	}



}

class Sensor {
	constructor(name, index) {
		this.name = name;
		this.index = index;

		this.active = false; //default is false
		this.count = 0; //Default count is 0
		this.delay = 0; //Default delay is 0
	}


	//Updates the  active field
	updateActive(active) {
		this.active = active;
	}

	//Updates the count
	updateCount(count) {
		this.count = count;
	}

	//Updates the delay
	updateDelay(delay) {
		this.delay = delay;
	}


	getCount() {
		return this.count;
	}
}

