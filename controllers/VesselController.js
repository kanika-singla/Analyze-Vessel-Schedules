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
        if(portData.length==0) {
            portData = await this.populatePortData();
        }
        return portData.slice(0,5);
    }

    async getLeastArrivals() {
        if(portData.length==0) {
            portData = await this.populatePortData();
        }
        // TODO: handle in case portdata contains less than 5 elements
        return portData.slice(portData.length-5,portData.length);
    }

    async populatePortData() {
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
                    if(!portCall.isOmitted) {
                        let portIndex = portData.findIndex(port => port["id"] === portCall.port.id);
                        if(portIndex != -1) {
                            portData[portIndex]["arrivals"]++;
                        } else {
                            portData.push({
                                id: portCall.port.id,
                                arrivals: 1,
                                name: portCall.port.name
                            });
                        }
                    }
                });
            }
        });
        return portData;
    }

}

module.exports = VesselController;