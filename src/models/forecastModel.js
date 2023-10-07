/**
 *  Forecast model for fetching forcast data from DB
 * 
 */

const { getConnection } = require("../services/DatabaseConnectionFactory");
const sqlQueries = require("../config/SQL_queries.json");

function getForcastData() {
    return new Promise(async (res, rej) => {
        try {
            const dbConnection = await getConnection();

            const query = sqlQueries.getForcecastData;
            const results = await dbConnection.runQuery(query);
            res(results);
        } catch (err) {
            rej(err);
        }
    });
}

module.exports = {
    getForcastData
};