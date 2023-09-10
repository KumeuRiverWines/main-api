//Importing modesl
const nodeModel = require("../models/nodeModel");
const databaseModel = require("../models/databaseModel");
const nodeDataModel = require("../models/nodeDataModel");

async function getAllNodeData(req, res) {
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
}

async function getNodeDate(req,res) {
	const params = req.query;	
	if("count" in params && "id" in params) {
		const sql = `SELECT * FROM measurement WHERE node_id='${params.id}' ORDER BY timestamp DESC LIMIT ${params.count}`;

		try {
			const results = await queryDb(sql);
			res.send(results.rows);
		} catch(err) {
			res.send({
				error: "ERROR WITH DB"
			});
		}
	} else {
		res.send({
			error: "Invalid params"
		});
	}
}

async function getNodeTemperature(req, res) {
	const sql = "SELECT node_id, temperature, timestamp FROM measurement WHERE timestamp >= NOW() - INTERVAL '10 days' ORDER BY timestamp DESC";

	try {
		const response = await pool.query(sql);
		res.send(response.rows);
	} catch (error) {
		console.log(error);
	}
}

async function getNodeLastReading(req, res) {
	const id = req.params.id;
	
	if(id) {
		const node = nodeModel.getNodeFromId(id);
		if(node) {
			const lastReadingObj = await nodeDataModel.getLastNodeReading(body.id);

			if(lastReadingObj) {
				res.send({
					lastReadingObj
				});
			} else {
				res.send({
					message: "Not entry found"
				});
			}
		} else {
			res.send({
				message: "Node doesn't exist"
			});
		}
	} else {
		res.send({
			message: "Invalid params"
		});
	}
}



module.exports = {
    getAllNodeData,
    getNodeTemperature,
    getNodeDate,
	getNodeLastReading
};