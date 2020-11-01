const axios = require("axios");

let portData = [];

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

    async getSchedule(portIMO) {
        let schedule =  await axios.get(this.#apiCalls.schedule+portIMO);
        if(schedule !== undefined && schedule.hasOwnProperty("data")) {
             return schedule.data
         }
         return [];
    }

    async getMostArrivals() {
        portData = await this.populatePortData;
        
        portData.sort(function(a, b) {
            return b.arrivals - a.arrivals;
        });
        return portData.slice(0,5);
    }

    async getLeastPortCalls() {
        await this.populatePortData();
        
        portData.sort(function(a, b) {
            return a.portCalls - b.portCalls;
        });
        return portData.slice(0,5);
    }

    async populatePortData() {
        if(portData.length !=0 ) { return portData }
        console.log("populating data");
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
                schedule.portCalls.forEach(portCall => {
                    let portIndex = portData.findIndex(port => port["id"] === portCall.port.id);
                    if(portIndex != -1) {
                        if(!portCall.isOmitted) {
                            portData[portIndex]["arrivals"]++;
                        }
                        portData[portIndex]["portCalls"]++;
                    } else {
                        let portDetails = {
                            id: portCall.port.id,
                            name: portCall.port.name,
                            portCalls: 1,
                            arrivals: 0
                        };
                        if(!portCall.isOmitted) {
                            portDetails["arrivals"] = 1;
                        }
                        portData.push(portDetails);
                    }
                });
            }
        });
        return portData;
    }

}

module.exports = VesselController;