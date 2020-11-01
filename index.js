const express = require("express");
require("dotenv").config();
const routes = require("./routes/routes.js");

const app = express();
routes(app);

const port = process.env.port;

app.listen(port, function() {
    console.log("Server running on port: "+port);
});