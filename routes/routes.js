

module.exports = function(app) {
    const vesselControllerClass = require("../controllers/VesselController.js");
    const vesselControllerObj = new vesselControllerClass();

    app.get("/", function(request, response) {
        response.send("Welcome!");
    });

    app.get("/mostArrivalsPort", async function(request, response) {
        let mostArrivalsPorts = await vesselControllerObj.getMostArrivals();
        response.send(mostArrivalsPorts);
    });

    app.get("/leastPortCalls", async function(request, response) {
        let leastPortCalls = await vesselControllerObj.getLeastPortCalls();
        response.send(leastPortCalls);
    });

    app.get("/portPercentiles", async function(request, response) {
        let portPercentiles = await vesselControllerObj.getPercentilePortCallDuration();
        response.send(portPercentiles);
    });

    app.get("/vesselPercentiles", async function(request, response) {
        let vesselPercentiles = await vesselControllerObj.getVesselPercentiles();
        response.send(vesselPercentiles);
    });

}
