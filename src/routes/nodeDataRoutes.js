//Import express
const express = require("express");
const router = express.Router();

const nodeDataController = require("../controllers/nodeDataController");

/**
 * nodeData Routes
 */

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
router.get("/:id/sensors/", nodeDataController.getNodeSensorData);

/**
 * Gets the last reading that the node has uplinked
 */
//router.get("/:id/sensors/last", nodeDataController.getNodeLastReading);

/**
 * Request params:
 * id - id of node
 * sensor - specific sensor to fetch
 * days - number of days to collect from current time 
 */
router.get("/:id/sensors/:sensor/:days", nodeDataController.getNodeSensorDays);

function returnNotImplemented(req, res) { 
    res.status(501).send({
        message: "End point not implemented" 
    });
}


//Export routes
module.exports = router;
