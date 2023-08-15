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
/*
const pool = new Pool({
    user: "kumeu",
    host: "192.168.1.2",
    database: "kumeudb",
    password: "QV8nXb2t5B",
    port: "5432"
});
*/


//RUN TIME VARIABLES
let intervalTime = 15; //Means that every X there should be a data packet

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
	//Looking at payload data	
	const data = req.body.data;
	console.log(data);
	if("loraSend" in data) {
		console.log("Updating send Delay to : " + data.loraSend);
		intervalTime = data.loraSend;
	}

	if("nodeInfo" in data) {
		console.log("updating node info");
		NodeState = data.nodeInfo;
	}

	res.send({
		validUpdate: true,
		updateSend: false
	});
});

app.get("/api/node/info", (req,res) => {
	NodeState.splice(0,0,intervalTime);

	console.log(NodeState);
	res.send({
		state: NodeState
	});
	NodeState.splice(0, 1);
});


app.listen(3000, () => {
    console.log("Starting Kumeu API on PORT 3000");
});


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

function sendDownlink(ID, delay) {
	const downLinkURL = `https://au1.cloud.thethings.network/api/v3/as/applications/${APP_ID}/webhooks/${WEBHOOK_ID}/devices/${DEV_ID}/down/push`;
	console.log(downLinkURL);
	console.log(delay);
	axios({
		method: 'post',
		url: downLinkURL,
		headers: { Authorization: `Bearer ${API_KEY}` },
		data: {
			downlinks: [{
				f_port: 1,
				decoded_payload: {
					bytes: [delay,0]
				}
			}]
		}
	}).then((res) => {
		console.log("DOWN LINK DONE");
	}).catch((err) => {
		console.log(err);
	});
}

