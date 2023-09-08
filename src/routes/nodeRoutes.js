//Importing express
const express = require("express");
const router = express.Router();

/**
 * Node Routes
 */

//Uplink messages from "The Things Network"
router.post("/uplink",  returnNotImplemented);

//Update node mode
router.post("/:id/mode/update", returnNotImplemented);

//Get node mode
router.get("/:id/mode", returnNotImplemented);

//Gets all active nodes
router.get("/active", returnNotImplemented);




function returnNotImplemented(req, res) { 
    res.status(501).send({
        message: "End point not implemented" 
    });
}

//Export routes
module.exports = router;