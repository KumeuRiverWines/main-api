/**
 * Node Info Model.
 * Accesses information regarding node information
 * 
 * Pieces of node information:
 * - Node EUI - String
 * - Node Last Update - Date OBJ
 * - Node Avaliable sensors -SensorOBJ
 * - Node Active sensors - SensorOBJ
 * -----Should the Sensor OBJ have both active and avaliable in the same obj?
 * - Node Location - LocationObj
 */
const sqlQueries = require("../config/SQL_queries.json");


//Variable for accessing the Datbase
const {getConnection} = require("../services/DatabaseConnectionFactory");

function getAllNodeInfo() {
    return new Promise(async (res, rej) => {
        try {
            const dbConnection = await getConnection(); //Will return db object

            if(dbConnection) {
                const query = sqlQueries.selectAllNodeInfo;
                const results = await dbConnection.runQuery(query);
                res(results);
            } else {
                rej("No DB Connection");
            }
        } catch(err) {
            rej(err);
        }
    });
}

function validateNodeId(id) {
    return new Promise(async (res, rej) => {
        try {
            const nodeData = await getAllNodeInfo();
            console.log(nodeData);
            console.log(id);
            for (index in nodeData) {
                if (nodeData[index]["node_id"] === id) {
                    return res(true);
                }
            }
            res(false);
        } catch(err) {
            rej(err);
        }
    });
}

module.exports = {
    getAllNodeInfo,
    validateNodeId
};
