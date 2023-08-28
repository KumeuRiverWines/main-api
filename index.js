//Importing classes
const Node = require("./classes/Node");

//Express Package
const express = require("express");
const app = express();
app.use(express.json());

//Moment setup
const moment = require("moment");

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
let lastIntervalTime = 15; //Intervaltime of the last send
let currentMode = "Standard";

//Down link variables
const APP_ID = "kuemu-river-wines-app"; 
const DEV_ID = "eui-70b3d57ed005de54";
const WEBHOOK_ID = "api";


app.post("/", async (req, res) => {
	res.send().status(200); //Documentation says we should send res ASAP
	const totalTime = lastIntervalTime; //Time since the node started collecting data
	const dateTime = getDateTime(totalTime); //Time stamp for input

	if(!"end_device_ids" in req.body) {
		if(!"device_id" in req.body.end_device_ids) {
			console.log("Invalid payload");
			return;
		}
	}	

	const deviceId = req.body.end_device_ids.device_id;
	if (!nodeMap.has(deviceId)) {
		const newNode = new Node(deviceId, "Not Set", "Standard");
		nodeMap.set(deviceId, newNode);
	}
	sendDownlink(deviceId);

	//NOW TO TYPE IS ALL OUT LEGIT
	if ("uplink_message" in req.body) {
		if ("decoded_payload" in req.body.uplink_message) {
			let payload = req.body.uplink_message.decoded_payload;
			const queryMap = new Map(); //Maps a date and time to a json object that has all the information for the sql query

			const results = await (new Promise((res) => {
				//temperature
				const sensors = ["temperature", "humidity", "leafWetness", "rainCollector", "windDirection", "windSpeed"];

				for (let index in sensors) {
					if (sensors[index] in payload.sensorData) {
						extractSensorDataFromPayload(queryMap, payload, sensors[index], dateTime, totalTime);
					}
				}
				res();
			}));
			
			if(queryMap.size > 0) {
				const queries = mapToQueries(queryMap, deviceId);
				console.log("Insert quries");
				for(let index in queries) {
					try {
						const result = queryDb(queries[index]);
						console.log(queries[index]);
					} catch(err) {
						console.log(err);
					}
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
		if(tempCount >= 1 && tempCount !== NaN) {
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
			const node = nodeMap.get(body.id);
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
	if("id" in req.query) {
		if(nodeMap.has(req.query.id)) {
			const node = nodeMap.get(req.query.id);
			res.send({
				info: node.toObj()
			});
		} else {
			res.send({
				error:"Node doesn't exist"
			});
		}
	} else {
		res.send({
			error: "Invalid"
		});
	}
});


app.listen(3000, () => {
    console.log("Starting Kumeu API on PORT 3000");
});



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
			nodeInfo.setLastUpdateInterval(payload[payload.length-1]); //Gets the last value in the array as the new last update time
		}).catch((err) => {
			console.log(err);
		});
	} else {
		console.log("Node is not registered");
	}
}

function getDateTime(updateTime) {
	let date = new Date();
	date.setSeconds(0);	
	date.setMilliseconds(0);
	const minutes = date.getMinutes();
	let minutesToAdjust = -(minutes % updateTime);

	if((-minutesToAdjust) >= (updateTime / 2)) {
		minutesToAdjust = (updateTime + minutesToAdjust);
	}

	date.setMinutes(minutes + minutesToAdjust);
	return date;
}

//FUNCTIONS
//Extracts data from payload and then maps the time to the data in the map
function extractSensorDataFromPayload(map, payload, name, dateTime, totalTime) {
	if (name in payload.sensorData) {
        const count = payload.sensorData[name].length; //Getting the length of the array
        const collectionInterval = totalTime / count; //Colleciton interval in minutes
        for (let index = 0; index < count; index++) {
          const backCount = count - 1 - index; //How many counts backward the time will be
          const collecitonTime = getBackDate(
            collectionInterval,
            dateTime,
            backCount
          );

          //Now we want to save the information in a specific time in the insertion map
          if(map.has(collecitonTime.getTime())) {
            //We want to append the object with this data
            const infoObj = map.get(collecitonTime.getTime());
            if (!(name in infoObj)) {
              //If there isn't already a temperature
              infoObj[name] = payload.sensorData[name][index];
              map.set(collecitonTime.getTime(), infoObj);
            } else {
              console.log("BIG ERROR SOMEHOW BUGGGGGGGGGG");
            }
          } else {
            //We want to create a new object to set the value
            const infoObj = {
              temperature: payload.sensorData[name][index],
            };
            map.set(collecitonTime.getTime(), infoObj);
          }
        }
    }
}

//Will be given count as (length-1)-index
function getBackDate(updateTime, date, count) {
	const countBackTime = count * updateTime;

	const momentDate = moment(date);	
	const updatedDate = momentDate.subtract(countBackTime, "minutes");


	return updatedDate.toDate();
}

//Sends a query to the database
//Has no query validation
function queryDb(query) {
	return new Promise((res, rej) => {
		try {
			pool.query(query).then((result) => {
				res(true);
			});
		} catch (error) {
			return rej();
		}
	});
}

function mapToQueries(map, nodeId) {
	let outputQueries = []; //
	const keyArray = Array.from(map.keys());

	for(let index in keyArray) {
		const date = new Date(keyArray[index]); //Getting the date and time for the input
		const data = map.get(keyArray[index]);

		//Adding dew point to data if possible
		if("temperature" in data && "humidity" in data) {
			data["dewPoint"] = calculateDewPoint(data["temperature"], data["humidity"]);
		};

		const tempQuery = `INSERT INTO measurement (entry_id, node_id, timestamp, temperature, humidity, dew_point, wind_speed, leaf_wetness, rainfall) VALUES (1, '${nodeId}', '${date.toISOString()}', ${data["temperature"] ?? "NULL"}, ${data["humidity"] ?? "NULL"}, ${data["dewPoint"] ?? "NULL"}, ${data["windSpeed"] ?? "NULL"}, ${data["leafWetness"] ?? "NULL"}, ${data["rainCollector"] ?? "NULL"})`;
		outputQueries.push(tempQuery);
	}

	return outputQueries;	
}

function calculateDewPoint(temperature, relativeHumidity) {
  const a = 17.625;
  const b = 243.04;
  const lnRH = Math.log(relativeHumidity / 100);
  const term1 = (a * temperature) / (b + temperature);
  const term2 = lnRH + term1;
  const dewPoint = (b * term2) / (a - term2);

  return dewPoint.toFixed(2); // Round to two decimal places
}
