const axios = require("axios");

/** A class containing vessel API functions */
class VesselAPIService {

    apiCalls = {
        availableVessels: process.env.vesselsAPI,
        schedule: process.env.scheduleAPI
    };

    /**
    * Reads the vessel API endpoint
    * @returns {array} array of vessels data
    */
    async readVesselApi() {
        try {
            console.time("Time to Read Vessels API");
            let vessels = await axios.get(this.apiCalls.availableVessels);
            console.timeEnd("Time to Read Vessels API");
            if(vessels !== undefined && vessels.hasOwnProperty("data")) {
                return vessels.data
            }
            return [];
        } catch(error) {
            console.error("Error while reading vessels: "+ error);
            console.error("Try adding api urls in .env file.");
        }
    }

    /**
    * Reads the schedule API endpoint
    * @param {number} vessel imo id
    * @returns {object} vessel data containing port calls
    */
    async getSchedule(portIMO) {
        try {
            console.time("Time to Read Schedule API");
            let schedule =  await axios.get(this.apiCalls.schedule+portIMO);
            console.timeEnd("Time to Read Schedule API");
            if(schedule !== undefined && schedule.hasOwnProperty("data")) {
                return schedule.data
            }
            return [];
        } catch(error) {
            console.error("Error while reading schedule for vessels: "+ error);
            console.error("Try adding api urls in .env file.");
        }
    }
}

module.exports = VesselAPIService;