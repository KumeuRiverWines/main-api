const forecastModel = require("../models/forecastModel");


async function getForecast(req, res) {
    try {
        const results = await forecastModel.getForcastData();
        res.send(results);
    } catch (error) {
        res.send({
            error: "Error collecting forecast data"
        });
    }
}

module.exports = {
    getForecast
};
