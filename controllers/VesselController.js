const percentile = require("percentile");
const portCallService = require("../services/PortCallService");
const portCallServiceObj = new portCallService();

let portData = [];
let vesselPortCallDelayPercentiles=[];
let vesselPortCallDelays=[];

/** A vessel controller containing business logic for calculating statistics based on vessels data provided
 *  Assuming we are only considering actual arrivals (stops/portCalls) i.e isOmitted flag is false
*/
class VesselController {

    /**
     * The top 5 ports with the most arrivals, and the corresponding number of total port calls for each port.
     * 1. Populate Port Data
     * 2. Sort port array based on *arrivals* DESC
     * 3. Limit to Top 5
     * @returns {array} array of 5 objects containing ports with most arrivals
     */
    async getMostArrivals() {
        //TODO: optimization for fields to be returned
        console.time("Time to get Most Arrivals");
        portData = await portCallServiceObj.populatePortData(portData);
        
        portData.sort(function(a, b) {
            return b.arrivals - a.arrivals;
        });
        console.timeEnd("Time to get Most Arrivals");
        return portData.slice(0,5);
    }

    /**
     * The top 5 ports that have the fewest port calls, and the number of total port calls for each port.
     * 1. Populate Port Data
     * 2. Sort port array based on *arrivals* ASC
     * 3. Limit to Top 5
     * @returns {array} array of 5 objects containing ports with least portCalls
     */
    async getLeastPortCalls() {
        console.time("Time to get Least PortCalls");
        portData = await portCallServiceObj.populatePortData(portData);
        
        portData.sort(function(a, b) {
            return a.arrivals - b.arrivals;
        });
        console.timeEnd("Time to get Least PortCalls");
        return portData.slice(0,5);
    }

    /**
     * For each port, the percentiles of port call durations: 5th, 20th, 50th, 75th and 90th percentiles.
     * 1. Populate Port Data
     * 2. Calculate percentiles (5,20,50,75,90) on port call duration (taken in hours)
     * @returns {array} array of objects(69 ports) containing name and percentiles of port call duration
     */
    async getPercentilePortCallDuration() {
        console.time("Time to get Percentle port call duration for each Port");
        portData = await portCallServiceObj.populatePortData(portData);
        // calculating percentiles for 5th percentile, 20th percentile and so on...
        let percentiles = [5, 20, 50, 75, 90];
        let portPercentiles = [];
        for(let i=0; i<portData.length;i++) {
            let port = {
                name: portData[i]["name"]
            };
            port["percentiles (5p, 20p, 50p, 75p, 90p) (hours)"] = percentile(percentiles, portData[i]["portCallDuration (hours)"]);
            portPercentiles.push(port);
        }
        console.timeEnd("Time to get Percentle port call duration for each Port");
        return portPercentiles;
    }

    /**
     * For each vessel, calculate the 5th, 50th and 80th percentiles for the port call delay when the vessel is 14, 7 and 2 days from arrival.
     * @returns {array} array of 12 objects(vessels) with vesselId, portDelays- 2 day delays, 7 day delays, 14 day delays
     */
    async getVesselPercentiles() {
        // percentile for day delays - 5th percentile, 50th percentile and so on...
        let percentiles = [5, 50, 80];
        portData = await portCallServiceObj.populatePortData(portData);
        let vesselPortCallDelays = portCallServiceObj.getVesselPortCallDelaysData();
        vesselPortCallDelays.forEach( vessel => {
            vesselPortCallDelayPercentiles.push({
                vesselId: vessel.id,
                percentileDelay: {
                    "2DaysDelay": percentile(percentiles, vessel["portDelays"]["2"]),
                    "7DaysDelay": percentile(percentiles, vessel["portDelays"]["7"]),
                    "14DaysDelay": percentile(percentiles, vessel["portDelays"]["14"])
                }
            })
        });
        return vesselPortCallDelayPercentiles;
    }
}

module.exports = VesselController;