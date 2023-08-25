//Importing classes
const Node = require("./classes/Node");

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

//Node map "Maps nodeId -> nodeObj"
const nodeMap = new Map();


//RUN TIME VARIABLES
let intervalTime = 15; //Means that every X there should be a data packet
let currentMode = "Standard";

//Down link variables
const APP_ID = "kuemu-river-wines-app"; 
const DEV_ID = "eui-70b3d57ed005de54";
const WEBHOOK_ID = "api";


app.post("/", async (req, res) => {
    res.send().status(200); //Documentation says we should send res ASAP

    const deviceId = req.body.end_device_ids.device_id;
	if(!nodeMap.has(deviceId)) {
		const newNode = new Node(deviceId, "Not Set", "Standard");
		nodeMap.set(deviceId, newNode);
	}
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
						s        }

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
	let count = 10; //Default count is 10
	//Getting request parameters
	const params = req.query;
	if("count" in params) {
		const tempCount = parseInt(params.count); //parsing for int
		if(tempCount >= 1 && tempCount === NaN) {
			count = tempCount;
		} else {
			res.status(400).send({
				error: "invalid param"
			});
			return;
		}
	}

    const sql = `SELECT * FROM measurement ORDER BY timestamp DESC LIMIT ${count}`;

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
/**
 * Payload structure
 * {
 *	"id": "{id}"
 *  "mode": "{mode}"
 * }
 */
app.post("/api/node/update", (req, res) => {
	let updated = false;
	console.log(req.body);
	const body = req.body;

	if("id" in body) {
		if(nodeMap.has(body.id)) {
			const node = nodeMap.get(id);
			if("mode" in body) {
				node.updateState(body.mode);
				return (res.send({
					updated: true
				}));	
			} else {
				return (res.send({
					updated: false,
					error: "Invalid Payload - Missing Mode"
				}));
			}
		} else {
			return (res.send({
				updated: false,
				error: "Invalid device ID"
			}));
		}
	} else {
		return (res.send({
			updated: false,
			error: "Invalid Payload - Missing device ID"
		}));
	}
});

app.get("/api/node/mode", (req,res) => {
	res.send({
		mode: currentMode,
	});
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


function sendDownlink(ID) {
	if(nodeMap.has(ID)) {
		const downLinkURL = `https://au1.cloud.thethings.network/api/v3/as/applications/${APP_ID}/webhooks/${WEBHOOK_ID}/devices/${DEV_ID}/down/replace`;
		const nodeInfo = nodeMap.get(ID);

		//TEMP PART CREATING FAKE PAYLOAD
		const payload = nodeInfo.getUpdateBytes();
		console.log(payload);	

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
			nodeInfo.setLastInterval(nodeInfo.getUpdateInterval());
		}).catch((err) => {
			console.log(err);
		});
	} else {
		console.log("Node is not registered");
	}
}
