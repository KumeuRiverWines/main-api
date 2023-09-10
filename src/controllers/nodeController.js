/**
 * Node controller handles requests coming from the nodeRoutes file
 */
//Imports
const Node = require("../classes/Node");

//Axios setup
const axios = require("axios");
const API_KEY = "NNSXS.QOGRSXIHHVKXIWKMPW65S2X2XU3RHXB2LASVKEI.BYZCKGTG3KRWPDURS3NXKNO4WWYRBNGYKDFPB3YV4M6JN2YKTBKA";
const APP_ID = "kuemu-river-wines-app"; 
const WEBHOOK_ID = "api";

/**
 *  Handles a uplink message from the things stack 
 */
async function handleUplinkRoute(req, res) {
    res.send().status(200); //Documentation says we should send res ASAP

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
		addNode(deviceId); //INSERTING INTO DB
	}

	//NOW TO TYPE IS ALL OUT LEGIT
	if ("uplink_message" in req.body) {
		if ("decoded_payload" in req.body.uplink_message) {
			let payload = req.body.uplink_message.decoded_payload;
			if("totalTime" in payload) {
				const totalTime = payload.totalTime; //Time since the node started collecting data
				let dateTime = getDateTime(totalTime); //Time stamp for input
				console.log("Date == " + dateTime);


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
							console.log("ERR HERE");
							console.log(err);
						}
					}
				}
			}
		}
	} 
}


/**
 * Handles Downlink messages to "The Thing Stack"
 * @param { String } id id of the node we want to send the downlink to
 * 
 * -----
 * updgrades maybe feed the function the payload iswell so that the method is 
 * not dependand on nodeMap
 */
async function sendDownlink(id) {
    return (new Promise((res, rej) => {
		if(nodeMap.has(id)) {
			const downLinkURL = `https://au1.cloud.thethings.network/api/v3/as/applications/${APP_ID}/webhooks/${WEBHOOK_ID}/devices/${id}/down/replace`;
			const nodeInfo = nodeMap.get(id);

			//TEMP PART CREATING FAKE PAYLOAD
			const payload = nodeInfo.getUpdateBytes();

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
			}).then((result) => {
				console.log("DOWN LINK DONE");
				nodeInfo.setLastUpdateInterval(payload[payload.length-1]); //Gets the last value in the array as the new last update time
				return res("Node updated");
			}).catch((err) => {
				console.log(err);
				return rej("Error updating with the things network");
			});
		} else {
			console.log("Node is not registered");
			return rej("Invalid ID");
		}
	}));
}


async function handleGetNodeModeRoute(req,res) {
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
};

/**
 * Payload structure
 * {
 *	"id": "{id}"
 *  "mode": "{mode}"
 * }
 */
async function handleUpdateNodeRoute(req, res) {
	const body = req.body;

	if("id" in body) {
		if(nodeMap.has(body.id)) {
			const node = nodeMap.get(body.id);
			if("mode" in body) {
				
				sendDownlink(body.id).then(() => {
					console.log("Updated");
					node.updateState(body.mode);
					return res.send({
						updated: true
					});
				}).catch((result) => {
					return res.send({
						updated: false,
						error: result
					});
				});
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
}


//Exporting functions
module.exports = {
	handleUpdateNodeRoute,
	sendDownlink,
	handleGetNodeModeRoute,
	handleUplinkRoute
};