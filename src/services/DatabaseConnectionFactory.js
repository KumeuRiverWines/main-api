/**
 * This file implements a factory pattern which makes it so there is only one connection open to a single database
 */
import Database from "../classes/Database";

const DatabaseObj = new Database();
const DatabaseConnection = null;

export default function getConnection() {
    return new Promise((res, rej) => {
        if(DatabaseConnection == null) {
            //Create open connection to database and return
            try {
                DatabaseObj.openConnecton 

                res();
            } catch(ex) {
                rej(ex);
            }
        } else {
            //Return the database connection
            return res(DatabaseConnection);
        }
    });
    } 




