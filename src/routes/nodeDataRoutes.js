//Import express
const express = require("express");
const router = express.Router();


/**
 * nodeData Routes
 */

/**
 * Get node information
 * Request param "id" = id of node
 */
router.get("/:id/", returnNotImplemented);

/**
 * Get node data for specific sensors 
 * Request param "id" = id of node
 * Query param "sensors" = csv of sensors wanted
 * Query param "time" = string of time wanted, 
 *   format = "x" is integer 
 *      xm("Minutes")
 *      xh("Hours") 
 *      xD("Days")
 *      xW("Weeks")
 *      xM("Months")
 *      xY("Years")
 */
router.get("/:id/sensors/", returnNotImplemented);




function returnNotImplemented(req, res) { 
    res.status(501).send({
        message: "End point not implemented" 
    });
}


//Export routes
module.exports = router;
