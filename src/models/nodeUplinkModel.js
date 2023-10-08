/**
 * Handles inserting node information into the database from the uplink messages
 */

const { getConnection } = require("../services/DatabaseConnectionFactory");

function runUplinkQuery(query) {
    return new Promise(async (res, rej) => {
        try {
            const dbConnection = await getConnection();

            const result = await dbConnection.runQuery(query);
            res(result);

        } catch(err) {
            rej(err);
        }
    });
}

module.exports = {
    runUplinkQuery
};