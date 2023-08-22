//Express Package
const express = require("express");
const app = express();
app.use(express.json());


//Axios setup
const axios = require("axios");
const API_KEY = "NNSXS.QOGRSXIHHVKXIWKMPW65S2X2XU3RHXB2LASVKEI.BYZCKGTG3KRWPDURS3NXKNO4WWYRBNGYKDFPB3YV4M6JN2YKTBKA";

//Postgresql Package
const Pool = require("pg").Pool;
//PASSWORD IS PLAIN TEXT MAKE A .ENV FILE PLZ

const pool = new Pool({
    user: "kumeu",
    host: "192.168.1.2",
    database: "kumeudb",
    password: "QV8nXb2t5B",
    port: "5432"
});



//RUN TIME VARIABLES
let intervalTime = 15; //Means that every X there should be a data packet
let currentMode = "Standard";

//Down link variables
const APP_ID = "kuemu-river-wines-app"; 
const DEV_ID = "eui-70b3d57ed005de54";
const WEBHOOK_ID = "api";

//Node state information
let NodeState = [{
	key:0,
	name: "Temperature",
	delay: 30,
	count: 2,
}, {
	key:1,
	name: "Humidity",
	delay: 30,
	count: 2
}, {
	key:2,
	name: "Wind Direction",
	delay: 30,
	count: 2
}, {
	key:3,
	name: "Wind Speed",
	delay: 30,
	count: 2
}, {
	key:4,
	name: "Leaf Wetness",
	delay: 30,
	count: 2
}, {
	key:5,
	name: "Rain Fall",
	delay: 30,
	count: 2
}];

let updateBytes = []; //Holds the value for the next payload to send


app.post("/", async (req, res) => {
    res.send().status(200); //Documentation says we should send res ASAP

    const deviceId = req.body.end_device_ids.device_id;
    //console.log(req.body.uplink_message.decoded_payload);
    sendDownlink(deviceId, calculateDelay());


    //NOW TO TYPE IS ALL OUT LEGIT
    if("uplink_message" in req.body) {
        if("decoded_payload" in req.body.uplink_message) {
            let payload = req.body.uplink_message.decoded_payload;

            //Building the data array to insert into DB  
            if("count" in payload) {
                for(let i = 0; i < payload.count; i++) {
                    let date = new Date().toISOString();

                    let tempArray = [1, 1, date];                    

                    //Adding temperature data
                    if("temperature" in payload.sensorData && !Number.isNaN(payload.sensorData.temperature[i])) {
                        tempArray.push(payload.sensorData.temperature[i]);
                    } else {
                        tempArray.push(null);
                    }

                    //Adding humidity data  
                    if("humidity" in payload.sensorData && !Number.isNaN(payload.sensorData.humidity[i])) {
                        tempArray.push(payload.sensorData.humidity[i]);
                    } else {
                        tempArray.push(null);
                    }

                    //Adding DEW POINT DATA //FAKE FOR NOW 
                    tempArray.push(null); //NULL VALUE UNTIL CALCULATING

                    //Adding wind speed data
                    if("windSpeed" in payload.sensorData && !Number.isNaN(payload.sensorData.windSpeed[i])) {
                        tempArray.push(payload.sensorData.windSpeed[i]);
                    } else {
                        tempArray.push(null);
                    }

                    //Adding leaf wetness data
                    if("leafWetness" in payload.sensorData && !Number.isNaN(payload.sensorData.leafWetness[i])) {
                        tempArray.push(payload.sensorData.leafWetness[i]);
                    } else {
                        tempArray.push(null);
                    }

                    //Adding rain data
                    if("rainCollector" in payload.sensorData && !Number.isNaN(payload.sensorData.rainCollector[i])) {
                        tempArray.push(payload.sensorData.rainCollector[i]);
                    } else {
                        tempArray.push(null);
                    }

                    let value = await insertDataIntoDb(tempArray);
                }
            }
        }
    }

});

app.get("/api/data/all", async (req, res) => {
    const sql = "SELECT * FROM measurement ORDER BY timestamp DESC LIMIT 10";

    try {
        const response =  await pool.query(sql);
        res.send(response.rows);
    } catch(error) {
        console.log(error);
    }
});

app.get("/api/data/all/temp", async (req, res) => {
	const sql = "SELECT node_id, temperature, timestamp FROM measurement WHERE timestamp >= NOW() - INTERVAL '10 days' ORDER BY timestamp DESC;";

	try {
		const response = await pool.query(sql);
		res.send(response.rows);
	} catch (error) {
		console.log(error);
	}
});

//END POINTS FOR DOWNLINK UPDATES TO NODE
app.post("/api/node/update", (req, res) => {
	let updated = false;
	console.log(req.body);
	const body = req.body;

	if("mode" in body) {
		switch(body.mode) {
			case "Standard":
			case "Turbo":
			case "Low Power":
			case "Custom":
				updated = true;
				currentMode = body.mode;
				setPayloadOnMode(currentMode);
				break;
		}
	}

	res.send({
		update: updated
	});
});

app.get("/api/node/mode", (req,res) => {
	res.send({
		mode: currentMode,
		delay: updateDelay,
		bytes: updateBytes
	});
});


app.listen(3000, () => {
    console.log("Starting Kumeu API on PORT 3000");
});


//Function for updating payload for different modes
function setPayloadOnMode(mode) {
	switch(mode) {
		case "Standard":
			updateDelay = 15; //Updating delay to 15 minutes
			updateBytes = [127,5,3,5,3,5,3,5,3,5,3,5,3,updateDelay];			
			break;
		case "Turbo":
			updateDelay = 5;	
			updateBytes = [67,1,5,1,5,updateDelay];
			break;
		case "Low Power":
			updateDelay = 60;
			updateBytes = [127,5,3,5,3,5,3,5,3,5,3,5,3,updateDelay];			
			break;
	}
}


//Function opens DB connection quries the db to insert data to sensor table
/**
 *  Inserts data in to "sensor" table in the DB
 * @param { array } values 
 */
async function insertDataIntoDb(values) {
	return new Promise( async (resolve, reject) => {
		const sql = `INSERT INTO measurement (entry_id, node_id, timestamp, temperature, humidity, dew_point, wind_speed, leaf_wetness, rainfall) VALUES (${values[0]}, ${values[1]}, '${values[2]}', ${values[3]}, ${values[4]}, NULL, ${values[6]}, ${values[7]}, ${values[8]})`;
		console.log(sql);

		try {
			const res = await pool.query(sql);
			//console.log(res);
		} catch (error) {
			console.log(error);
		}
		resolve(true);
	});
}

//DEW POINT CALCULATION = temp - ( (100-humidty) /5)

/*

INSERT INTO sensor (sensor_id, node_id, timestamp, temperature, humidity, dew_point, wind_speed, leaf_wetness, rainfall) VALUES (1, 1, '2023-06-19T04:41:31.538Z', 255.21, 255.21, NULL, 255.21, 255.21, 255.21)
*/


function calculateDelay() {
	let timeDelay = 0;
	const currentTimeMinute = new Date().getMinutes();
	let offset = currentTimeMinute % intervalTime;	
	if(1 < offset && offset < (intervalTime-1)) {
		timeDelay = intervalTime - offset;
	}

	return timeDelay % 255;
}


//HOW DOWN LINK PAYLOADS WORK?
/** Downlink payload is set into 3 parts
 * [x] where x = byte numbers
 * [0] delay time for sync ranging from 0-255
 * [1] packet type
 * 	Each bit in a the packet type represents a sensor
 * 	0 - Temperature
 * 	1 - Humidity
 * 	2 - Wind Direction
 * 	3 - Wind Speed
 * 	4 - Leaf Wetness
 * 	5 - Rain Fall
 * 	6 - LoRa <-- Not a sensor but used for sending 
 * [2-end] sensor information
 * 	Each has two bytes of information 
 * 	1 - Delay in minutes
 * 	2 - Count in packet
 */
//Returns byte array of the downlink payload
function createDownlinkPayload() {

}

let currentUpdateDelay = 1;
//End point for manually updateing node 
app.post("/api/manual/update", (req, res) => {
	console.log(req.body);
	if("id" in req.body) {
		let updateDelay = currentUpdateDelay;


		//Valid payload
		if("updateDelay" in req.body) {
			if(req.body.updateDelay >= 1 && req.body.updateDelay <= 255) {
				updateDelay = req.body.updateDelay
			} else {
				res.send({
		 			updated: false,
					message: "Invalid update delay time"
				});
				return;
			}
		}  			

		//Now we want to check for sensor information
		let packetType = 0;
		const sensors = req.body.sensors;
		for(const key in sensors) {
			switch(key) {
				case "Temperature":
					packetType = (packetType | (1 << 0));
					break;
				case "Humidity":
					packetType = (packetType | (1 << 1));
					break;
				case "Wind Direction":
					packetType = (packetType | (1 << 2));
					break;
				case "Wind Speed":
					packetType = (packetType | (1 << 3));
					break;
				case "Leaf Wetness":
					packetType = (packetType | (1 << 4));
					break;
				case "Rain Fall":
					packetType = (packetType | (1 << 5));
					break;
			}
		}

		packetType = (packetType | (1 << 6)); //setting the send delay bit
		

		//Now packet type is set we can make the packet
		const outputPacket = [calculateDelay(), packetType];
		for(let i = 0; i < 8; i++) {
			let mask = (1 << i);
			if(mask & packetType) {
				switch(i) {
					case 0:
						outputPacket.push(sensors["Temperature"].delay); //Pushing the delay
						outputPacket.push(sensors["Temperature"].count); //Pushing the count
						break;
					case 1:
						outputPacket.push(sensors["Humidity"].delay); //Pushing the delay
						outputPacket.push(sensors["Humidity"].count); //Pushing the count
						break;
					case 2: 
						outputPacket.push(sensors["Wind Direction"].delay); //Pushing the delay
						outputPacket.push(sensors["Wind Direction"].count); //Pushing the count
						break;
					case 3: 
						outputPacket.push(sensors["Wind Speed"].delay); //Pushing the delay
						outputPacket.push(sensors["Wind Speed"].count); //Pushing the count
						break;
					case 4:
						outputPacket.push(sensors["Leaf Wetness"].delay); //Pushing the delay
						outputPacket.push(sensors["Leaf Wetness"].count); //Pushing the count
						break;
					case 5:
						outputPacket.push(sensors["Rain Fall"].delay); //Pushing the delay
						outputPacket.push(sensors["Rain Fall"].count); //Pushing the count
						break;
					case 6:
						outputPacket.push(updateDelay);
						break;
				}
			}
		}


		//Updating the payload to the next payload to send
		updateBytes = outputPacket;

		res.send({
			bytes: outputPacket,
			updated: true
		});
		return;
	} else {
		res.status(400).send({
			message: "Invalid payload",
			updated: false
		});
	}
});



function sendDownlink(ID, delay) {
	const downLinkURL = `https://au1.cloud.thethings.network/api/v3/as/applications/${APP_ID}/webhooks/${WEBHOOK_ID}/devices/${DEV_ID}/down/replace`;

	//TEMP PART CREATING FAKE PAYLOAD
	const payload = updateBytes; 


	axios({
		method: 'post',
		url: downLinkURL,
		headers: { Authorization: `Bearer ${API_KEY}` },
		data: {
			downlinks: [{
				f_port: 1,
				decoded_payload: {
					bytes: payload
				}
			}]
		}
	}).then((res) => {
		console.log("DOWN LINK DONE");
	}).catch((err) => {
		console.log(err);
	});
}




