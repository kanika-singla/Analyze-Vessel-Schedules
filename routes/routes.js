

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

    app.get("/getSchedule/:portIMO", async function (request, response) {
        if(request.params.hasOwnProperty("portIMO") && request.params.portIMO !== undefined) {
            try {
                const res = await vesselController.getSchedule(request.params.portIMO);
                if(res !== undefined && res.hasOwnProperty("data")) {
                    response.send(res.data);
                }
            } catch (error) {
                response.send("Could not find schedule for port: "+ request.params.portIMO);
            }
        } else {
            response.send("Please input portIMO");
        }
    });

    app.get("/populatePortData", async function(request, response) {
        let portData = await vesselController.populatePortData();
        response.send(portData);
    });

    app.get("/mostArrivalsPort", async function(request, response) {
        let mostArrivalsPorts = await vesselController.getMostArrivals();
        response.send(mostArrivalsPorts);
    });

    app.get("/leastPortCalls", async function(request, response) {
        let leastPortCalls = await vesselController.getLeastPortCalls();
        response.send(leastPortCalls);
    });
}