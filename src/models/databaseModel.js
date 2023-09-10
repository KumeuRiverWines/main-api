/**
 * databaseModel - Acts as a layer above the database and interacts with the databse directly
 * 
 * TODO: 
 * - Handle db connection error
 * - Handle db events 
 * - Set up functions to interact with DB
 */

const { Pool } = require("pg");
const pool = new Pool({
    user: "kumeu",
    host: "192.168.1.2",
    database: "kumeudb",
    password: "QV8nXb2t5B",
    port: "5432"
});

//Connection event will pull the node information
pool.on("connect", () => {
    console.log("Db connected")
});

/**
 * FUNCTIONS
 */

//Sends a query to the database
//Has no query validation
function queryDb(query) {
	return new Promise((res, rej) => {
		try {
			pool.query(query).then((result) => {
				res(result);
			}).catch((err) => {
				console.log(err);	
			});
		} catch (error) {
			console.log("ERR HERE =" + error.message);
			return rej();
		}
	});
}


module.exports = {
    pool
};