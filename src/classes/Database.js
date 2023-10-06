/**
 * Database class that creates a connection to a database, and has functions on how models can access the database
 */
//Importing config and setting up config variables
import config from "../config/databaseConfig.json";
const { Client } = require("pg");


class Database {
  constructor() {
    this.connection = null;
    this.connectionOpen = false;
  }

  openConnecton() {
    return new Promise((res, rej) => {
        if(!this.connectionOpen) {
          this.connection = new Client({
            user: config.user,
            host: config.host,
            database: config.database,
            password: config.password,
            port: config.port
          });

          this.connection.on("end", () => {
            this.connectionOpen = false;
          });

          //Connection event will pull the node information
          this.connection.on("connect", () => {
            this.connectionOpen = true;
            res("Connection open");
          }).catch((err) => {
            rej("Failed to open connection");
          });
        } else {
          res("Connection open");
        }
    });
  }

  closeConnection() {
    return new Promise((res, rej) => {
      if(this.connection) {
        this.connection.end().then(() => {
          res("Connection closed");
        }).catch((err) => {
          rej(err);
        });
      } else {
        rej("Connection hasn't been created");
      }
    });
  }

  getConnection() {
    return this.connection;
  }

  runQuery(query) {
    return new Promise((res, rej) => {
		try {
			this.connection.query(query).then((result) => {
				res(result);
			});
		} catch (error) {
			console.log("ERR HERE =" + error.message);
			return rej(null);
		}
	}); 
  }
}

export default Database;