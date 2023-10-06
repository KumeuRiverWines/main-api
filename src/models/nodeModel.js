/**
 * Node models will access all node information and store information regarding nodes
 */

//Imports
const Node = require("../classes/Node");

//Singleton of the node information map
/**
 * Node map will map id -> nodeStateObj
 */
const nodeMap = new Map();


/**
 * Gets node from the map 
 * @param { String } id 
 * @returns node Object || NULL
 */
const getNodeFromId = (id) => {
    if(nodeMap.has(id)) {
        return nodeMap.get(id);
    } else {
        return null;
    }
};

const createNode = (id) => {
    if(nodeMap.has(id)) {
        return false; //already exists
    } else {
        nodeMap.set(id, new Node(id, "Not Set", "Standard")); //Mapping id -> nodeObj
        return true;
    }
};


/**
 * Add node to table
 * 
 * This function can happen in background 
 */
function addNode(ID) {
	const currentTime = new Date().toISOString();
	const insertQuery = `INSERT INTO nodes (ID, name, lastSeen) VALUES ('${ID}', '${ID}', '${currentTime}')`;

	try {
		const result = queryDb(insertQuery);
	} catch(err) {
		console.log("Error inserting node");
		console.log(err);
	}
}


/**
 * Funciton for updating the nodes table in the db with node information
 */
async function pullNodeInformaiton() {
	console.log("Pulling node information");
	const selectQuery = `SELECT * FROM nodes`;

	try {
		const result = await queryDb(selectQuery);
		const rows = result.rows;
			
		console.log("PULLED NODE INFO");
		console.log(rows);

		//Now we want to loop throught the rows insrting into the map
		for(let index in rows) {
			if("ID" in rows) {
				nodeMap.set(rows.ID, new Node(rows.ID, "n/a", "Standard"));
			}
		}
	} catch(err) {
		console.log("Error grabbing information");
		console.log(err);
	}
}

//Exports
module.exports = {
	getNodeFromId,
	createNode,
	addNode,
	pullNodeInformaiton
};