

module.exports = function(app) {
    const vesselControllerClass = require("../controllers/VesselController.js");
    const vesselController = new vesselControllerClass();

    app.get("/", function(request, response) {
        response.send("Welcome!");
    });

    app.get("/mostArrivalsPort", async function(request, response) {
        let mostArrivalsPorts = await vesselController.getMostArrivals();
        response.send(mostArrivalsPorts);
    });

    app.get("/leastPortCalls", async function(request, response) {
        let leastPortCalls = await vesselController.getLeastPortCalls();
        response.send(leastPortCalls);
    });

    app.get("/portPercentiles", async function(request, response) {
        let portPercentiles = await vesselController.getPercentilePortCallDuration();
        response.send(portPercentiles);
    });

    app.get("/vesselPercentiles", async function(request, response) {
        let vesselPercentiles = await vesselController.getVesselPercentiles();
        response.send(vesselPercentiles);
    });

}
