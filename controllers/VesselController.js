const axios = require("axios");

class VesselController {
    #apiCalls = {
        availableVessels: process.env.vesselsAPI,
        schedule: process.env.scheduleAPI
    };
    async readVesselApi() {
        let vessels = await axios.get(this.#apiCalls.availableVessels);
        if(vessels !== undefined && vessels.hasOwnProperty("data")) {
            return vessels.data
        }
        return []
        ;
    }
}

module.exports = VesselController;