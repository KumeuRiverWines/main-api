/**
 * Node controller handles requests coming from the nodeRoutes file
 */
//Importing model
const NodeUplinkModel = require("../models/nodeUplinkModel");

//Imports
const dateModel = require("../models/dateModel");
const uplinkPayloadService = require("../services/uplinkPayloadService");
const nodeModel = require("../models/nodeModel");


//Axios setup
const axios = require("axios");

const configuration = require("../config/configuration.json");
const API_KEY = configuration.thethingsnetwork.downlink.API_KEY;
const APP_ID = configuration.thethingsnetwork.downlink.APP_ID;
const WEBHOOK_ID = configuration.thethingsnetwork.downlink.WEBHOOK_ID;


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

	if ("uplink_message" in req.body) {
		if ("decoded_payload" in req.body.uplink_message) {
			let payload = req.body.uplink_message.decoded_payload;
			if("totalTime" in payload) {
				const totalTime = payload.totalTime; //Time since the node started collecting data
				let dateTime = dateModel.getClosestCollectionDateTime(totalTime); //Time stamp for input

				const queryMap = new Map(); //Maps a date and time to a json object that has all the information for the sql query

				const results = await (new Promise((res) => {
					const sensors = ["temperature", "humidity", "leafWetness", "rainCollector", "windDirection", "windSpeed"];

					for (let index in sensors) {
						if (sensors[index] in payload.sensorData) {
							uplinkPayloadService.extractSensorDataFromPayload(queryMap, payload, sensors[index], dateTime, totalTime);
						}
					}
					res();
				}));
				
				if(queryMap.size > 0) {
					const queries = uplinkPayloadService.mapToQueries(queryMap, deviceId);
					console.log("Insert quries");
					for(let index in queries) {
						try {
							const result = await NodeUplinkModel.runUplinkQuery(queries[index]);
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
			const nodeInfo = nodeModel.getNodeFromId(id);

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
		const node = nodeModel.getNodeFromId(req.query.id);
		if(node) {
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
		const node = nodeModel.getNodeFromId(body.id);
		if(node) {
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