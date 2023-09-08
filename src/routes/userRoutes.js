//Importing express
const express = require("express");
const router = express.Router();


/**
 * USER ROUTES
 */

//Node data
router.get("/:id/:sensor")


function returnNotImplemented(req, res) { 
    res.status(501).send({
        message: "End point not implemented" 
    });
}

//Exporting the routes
module.exports = router;