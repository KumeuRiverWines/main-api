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

//Setting up the routes
app.use("/api/forecast", forecastRoutes);
app.use("/api/nodeData", nodeDataRoutes);
app.use("/api/node", nodeRoutes);

//Starting server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Starting Kumeu API on PORT " + PORT);
});