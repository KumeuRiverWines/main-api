const databaseModel = require("../models/databaseModel");


/**
 * Functions
 */

/**
 * Gets the last sensor reading that was uplinked from the node 
 * Assumes that valid ID is passed in
 * @param { String } id valid id
 * @returns rowObj || NULL
 */
async function getLastNodeReading(id) {
    return new Promise((res, rej) => {
        const query = `SELECT * FROM measurement WHERE node_id='${id}' ORDER BY timestamp DESC LIMIT 1`;

        databaseModel.queryDb(query).then((result) => {
            if(result.rows >= 1) {
                res(result.rows[0]);
            } else {
                rej(null);
            }
        }).catch((err) => {
            rej(null);
        });
    });
}


module.exports = {
    getLastNodeReading
};