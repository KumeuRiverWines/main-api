//Import express
const express = require("express");
const router = express.Router();

const forecastModel = require("../controllers/forecastController");

router.get("/data/all/allforecast", forecastModel.getForecast);


function returnNotImplemented(req, res) { 
    res.status(501).send({
        message: "End point not implemented" 
    });
}


//Export routes
module.exports = router;