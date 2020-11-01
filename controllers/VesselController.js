const axios = require("axios");
const percentile = require("percentile");

let portData = [];
let vesselPortCallDelays = [];

class VesselController {
    #apiCalls = {
        availableVessels: process.env.vesselsAPI,
        schedule: process.env.scheduleAPI
    };

    async readVesselApi() {
        try {
            console.time("Time to Read Vessels API");
            let vessels = await axios.get(this.#apiCalls.availableVessels);
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

    async getSchedule(portIMO) {
        try {
            console.time("Time to Read Schedule API");
            let schedule =  await axios.get(this.#apiCalls.schedule+portIMO);
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

    async getMostArrivals() {
        //TODO: optimization for fields to be returned
        console.time("Time to get Most Arrivals");
        await this.populatePortData();
        
        portData.sort(function(a, b) {
            return a.portCalls - b.portCalls;
        });
        console.timeEnd("Time to get Most Arrivals");
        return portData.slice(0,5);
    }

    async getLeastPortCalls() {
        console.time("Time to get Least PortCalls");
        await this.populatePortData();
        
        portData.sort(function(a, b) {
            return a.portCalls - b.portCalls;
        });
        console.timeEnd("Time to get Least PortCalls");
        return portData.slice(0,5);
    }

    async getPercentilePortCallDuration() {
        console.time("Time to get Percentle port call duration for each Port");
        await this.populatePortData();
        let percentiles = [5, 20, 50, 75, 90];
        let portPercentiles = [];
        for(let i=0; i<portData.length;i++) {
            let port = {
                name: portData[i]["name"]
            };
            port["percentiles"] = percentile(percentiles, portData[i]["portCallDuration"]);
            portPercentiles.push(port);
        }
        console.timeEnd("Time to get Percentle port call duration for each Port");
        return portPercentiles;
    }

    async populatePortData() {
        if(portData.length !=0 ) { return portData }
        console.time("Time to populate Port Data");
        var vessels = await this.readVesselApi();
        if(vessels.length==0) {
            console.log("No vessels found");
            return [];
        }
        let promiseArr=[];
        vessels.forEach( (vessel) => {
            promiseArr.push(this.getSchedule(vessel.imo));
        })
        const schedules = await Promise.all(promiseArr);
        schedules.forEach( (schedule) => {
            if(schedule != undefined && schedule.hasOwnProperty("portCalls")) {
                schedule.portCalls.forEach( (portCall) => {
                    let portIndex = portData.findIndex(port => port["id"] === portCall.port.id);
                    let duration = this.getPortCallDuration(portCall.departure, portCall.arrival);
                    //For step 4: calculate vessel port call delay
                    let portCallDelay = this.getPortCallDelay(schedule.vessel.imo, portCall.port.id, portCall.arrival, portCall.logEntries);
                    if(portIndex != -1) {
                        if(!portCall.isOmitted) {
                            portData[portIndex]["arrivals"]++;
                        }
                        portData[portIndex]["portCalls"]++;
                        portData[portIndex]["portCallDuration"].push(duration);
                    } else {
                        let portDetails = {
                            id: portCall.port.id,
                            name: portCall.port.name,
                            portCalls: 1,
                            arrivals: 0,
                            portCallDuration: [duration]
                        };
                        if(!portCall.isOmitted) {
                            portDetails["arrivals"] = 1;
                        }
                        portData.push(portDetails);
                    }
                });
            }
        });
        console.timeEnd("Time to populate Port Data");
        return portData;
    }

    getPortCallDuration(departure, arrival) {
        if(arrival != null && departure != null) {
            let duration = ((new Date(departure)).getTime() - (new Date(arrival)).getTime())/ (60*60*1000);
            return duration.toFixed(2); //in hours
        }
        return 0;
    }

    async getVesselPercentiles() {
        await this.populatePortData();
        return vesselPortCallDelays;
    }

    getPortCallDelay(vesselId, portId, arrival, logs) {
        let vesselDelays = {};
        let arrivalTime = (new Date(arrival)).getTime();

        let dayDelays = {
            "2": 2*24*60,
            "7": 7*24*60,
            "14": 14*24*60
        }; // in minutes
        logs.forEach( (log) => {
            if(log.updatedField == "arrival" && log.arrival != null) {
                let createdTime = (new Date(log.createdDate)).getTime();
                if( (arrivalTime - createdTime)/(60*1000) > dayDelays["2"] && (arrivalTime - createdTime)/(60*1000) < dayDelays["7"] ) {
                    vesselDelays["2dayDelay"] = (new Date(arrival)).getHours() - (new Date(log.arrival)).getHours();
                }
            }
        });

        let vesselIndex = vesselPortCallDelays.findIndex(vessel => vessel["id"] === vesselId);
        let vesselData;
        if(vesselIndex == -1) {
            vesselData = {
                id: vesselId,
                port: [{
                    id: portId,
                    portDelays: [vesselDelays]
                }]
            };
            vesselPortCallDelays.push(vesselData);
        } else {
            vesselPortCallDelays[vesselIndex]["port"].push({
                id: portId,
                portDelays: [vesselDelays]
            });
        }
    }

}

module.exports = VesselController;