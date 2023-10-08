//Import express
const express = require("express");
const router = express.Router();



router.get("/data/all/allforecast", returnNotImplemented);


function returnNotImplemented(req, res) { 
    res.status(501).send({
        message: "End point not implemented" 
    });
}


//Export routes
module.exports = router;