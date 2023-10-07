const { getConnection } = require("../services/DatabaseConnectionFactory");
const sqlQueries = require("../config/SQL_queries.json");

/**
 * Functions
 */
function getNodeSensorsDataFromTime(nodeId, sensors, timeFrom) {
    return new Promise(async (res, rej) => {
        try {
            const dbConnection = await getConnection();

            let query = sqlQueries.selectNodeSensorDataFromTime;
            //Now we fill the query with the information we want
            query = query.replace("${sensors}", sensors);
            query = query.replace("${time}", timeFrom);
            query = query.replace("${id}", nodeId);

            const results = await dbConnection.runQuery(query);
            res(results);
        } catch(err) {
            rej(err);
        }
    });
}

function getNodeSensorDataFromDay(nodeId, sensor, days) {
    return new Promise(async (res, rej) => {
       const dbConnection = await getConnection(); 

       let query = sqlQueries.selectNodeSingleSensorDateFromDayAgo;
       query = query.replace("${id}", nodeId);
       query = query.replace("${days}", days);
       query = query.replace("${sensor}", sensor);

       console.log(query);

       const results = await dbConnection.runQuery(query);
       res(results);
    });
}






module.exports = {
    getNodeSensorsDataFromTime,
    getNodeSensorDataFromDay
};