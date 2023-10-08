/**
 * This file implements a factory pattern which makes it so there is only one connection open to a single database
 */
const Database = require("../classes/Database");

const DatabaseObj = new Database();
const DatabaseConnection = null;

function getConnection() {
    return new Promise((res, rej) => {
        if(DatabaseObj == null) {
            //Create open connection to database and return
            DatabaseObj = new Database();
            return res(DatabaseObj); 
        } else {
            //Return the database connection
            return res(DatabaseObj);
        }
    });
} 

module.exports = {
    getConnection
};
