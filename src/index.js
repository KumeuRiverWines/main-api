//Setting up env variables
require("dotenv").config();

//Express Package
const express = require("express");
const app = express();
app.use(express.json());

//Cors
const cors = require("cors");
app.use(cors());


//Importing route files
const forecastRoutes = require("./routes/forecastRoutes");
const nodeDataRoutes = require("./routes/nodeDataRoutes");
const nodeRoutes = require("./routes/nodeRoutes");
const userRoutes = require("./routes/userRoutes");

//Setting up the routes
app.use("/user", userRoutes);
app.use("/forecast", forecastRoutes);
app.use("/nodeData", nodeDataRoutes);
app.use("/node", nodeRoutes);

//Starting server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Starting Kumeu API on PORT " + PORT);
});