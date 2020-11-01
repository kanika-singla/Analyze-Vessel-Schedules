

module.exports = function(app) {
    const vesselControllerClass = require("../controllers/VesselController.js");
    const vesselController = new vesselControllerClass();

    app.get("/", function(request, response) {
        response.send("Welcome!<br>Please visit: '/readVessels' to read vessel data");
    });

    app.get("/readVessels", async function (request, response) {
        const res = await vesselController.readVesselApi();
        if(res !== undefined && res.hasOwnProperty("data")) {
            response.send(res.data);
        }
    });
    
}