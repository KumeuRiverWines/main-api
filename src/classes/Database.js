/**
 * Database class that creates a connection to a database, and has functions on how models can access the database
 */
//Importing config and setting up config variables
const config = require("../config/databaseConfig.json");
const Pool = require('pg').Pool

class Database {
  constructor() {
    this.connectionOpen = false;
    this.connection = new Pool({
      user: config.user,
      host: config.host,
      database: config.database,
      password: config.password,
      port: config.port
    });   
  }

  runQuery(query) {
    return new Promise((res, rej) => {
        this.connection.query(query, (error, result) => {
          if(error) {
            return rej(error);
          } 
          res(result.rows);
        });
	  }); 
  }
}

module.exports = Database;