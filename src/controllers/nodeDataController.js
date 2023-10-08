//Importing modesl
const nodeDataModel = require("../models/nodeDataModel");
const nodeInfoModel = require("../models/nodeInfoModel");

//Importing sensor config file
const Sensors = require("../config/Sensors.json");

//Importing helper functions
const ErrorResponseHelper = require("../Helper/ErrorResponseHelper");


/** UPDATED END POINTS */
async function getNodeSensorDays(req, res)  {
	const id = req.params.id;
	console.log("recv");

	if(id) {
		try {
			const validNode = await nodeInfoModel.validateNodeId(id);

			if(validNode) {
				const sensor = req.params.sensor;
				let days = req.params.days;

				//Validating sensor
				let validSensor = new Promise((res) => {
					for (let index in Sensors.sensors) {
						console.log(Sensors.sensor[index]);
						if (sensor == Sensors.sensors[index]) {
							return res(true);
						}
					}
					return res(false);
				});
				

				if(validSensor) {
					if(!isNaN(days))	{
						days = parseInt(days);

						const results = await nodeDataModel.getNodeSensorDataFromDay(id, sensor, days);
						res.send({
							nodeId: id,
							sensorData: results
						});
					} else {
						ErrorResponseHelper.res(res, "Invalid Day given please give a int of days")
					}
				} else {
					ErrorResponseHelper.resInvalidParams(res, "Invalid Sensor given");
				}
			} else {
				res.send({
					validId: false,
				});
			}
		} catch(err) {
			res.send({
				message: "Internel error connecting to db"
			});
		}
	} else {
		ErrorResponseHelper.resInvalidParams(res, "node Id not given");	
	}
}

//
async function getNodeSensorData(req, res) {
	const id = req.params.id;

	if(id) {
		//Checking if node ID is valid		
		try {
			const validNode = await nodeInfoModel.validateNodeId(id);
			if(validNode) {
				//Valid id so now we collect sensors information	
				const sensorsString = req.query.sensors;	
				let timeString = req.query.time;

				if(sensorsString && timeString) {
					//Validating sensors
					const splitString = sensorsString.split(",");
					for(let i in splitString) {
						for(let j in Sensors.sensors) {
							if(splitString[i] != Sensors.sensors[j]) {
								return ErrorResponseHelper.resInvalidParams("Invalid sensors given");
							}
						}
					}

					try {
						const backDate = new Date(timeString);
						timeString = backDate.toISOString();
					} catch(err) {
						return ErrorResponseHelper.resInvalidParams(res, "Invalid Date format needs to be ISO string");
					}

					const results = await nodeDataModel.getNodeSensorsDataFromTime(id, sensorsString, timeString);
					res.send({
						nodeId: id,
						sensorData: results
					});

				} else {
					ErrorResponseHelper.resInvalidParams(res, "No sensors or time given");
				}
			} else {
				res.send({
					validId: false
				});
			}
		} catch(err) {
			console.log(err);
			res.send({
				error: "Error fetching Data from DB"
			});
		}
	} else {
		ErrorResponseHelper.resInvalidParams(res, "node Id not given");	
	}
}


module.exports = {
	getNodeSensorData,
	getNodeSensorDays	
};