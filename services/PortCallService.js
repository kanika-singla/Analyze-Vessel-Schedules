
const vesselAPIService = require("../services/VesselAPIService");
const vesselAPIServiceObj = new vesselAPIService();
let vesselPortCallDelays = [];

/**
 * A class containing logic functions to populate and work around port calls
 */
class PortCallService {

    /** Function to calculate duration of a port-call 
     * @param {String} departure
     * @param {String} arrival
     * @returns {Number} duration in hours
    */
   getPortCallDuration(departure, arrival) {
        if(arrival != null && departure != null) {
            let duration = ((new Date(departure)).getTime() - (new Date(arrival)).getTime())/ (60*60*1000);
            return duration.toFixed(2); //in hours
        }
        return 0;
    }

    /**
     * Function to calculate port call delay from the arrival and logEntries array provided for each portCall
     * @param {Number} vesselId
     * @param {String} arrival 
     * @param {Array} logs
     */
    getPortCallDelay(vesselId, arrival, logs) {
        let vesselDelaysObj = {};
        let arrivalTime = (new Date(arrival)).getTime();

        let dayDelays = {
            "2": 2*24*60,
            "7": 7*24*60,
            "14": 14*24*60
        }; // in minutes
        logs.forEach( (log) => {
            if(log.updatedField == "arrival" && log.arrival != null) {
                let createdTime = (new Date(log.createdDate)).getTime();
                let logArrivalTime = (new Date(log.arrival)).getTime();
                if( (arrivalTime - createdTime)/(60*1000) > dayDelays["2"] && (arrivalTime - createdTime)/(60*1000) < dayDelays["7"] ) {
                    vesselDelaysObj["2dayDelay"] = Math.abs( (arrivalTime/(60*1000*60) - logArrivalTime/(60*1000*60)).toFixed(0) );
                }
                if( (arrivalTime - createdTime)/(60*1000) > dayDelays["7"] && (arrivalTime - createdTime)/(60*1000) < dayDelays["14"] ) {
                    vesselDelaysObj["7dayDelay"] = Math.abs( (arrivalTime/(60*1000*60) - logArrivalTime/(60*1000*60)).toFixed(0) );
                }
                if( (arrivalTime - createdTime)/(60*1000) > dayDelays["14"] ) {
                    vesselDelaysObj["14dayDelay"] = Math.abs( (arrivalTime/(60*1000*60) - logArrivalTime/(60*1000*60)).toFixed(0) );
                }
            }
        });
        if(vesselDelaysObj["2dayDelay"] == null) {
            if(vesselDelaysObj["7dayDelay"] == null) {
                if(vesselDelaysObj["14dayDelay"] == null) {
                    vesselDelaysObj["2dayDelay"] = vesselDelaysObj["7dayDelay"] = vesselDelaysObj["14dayDelay"] = 0;
                } else {
                    vesselDelaysObj["2dayDelay"] = vesselDelaysObj["7dayDelay"] = vesselDelaysObj["14dayDelay"];
                }
            } else {
                vesselDelaysObj["2dayDelay"] = vesselDelaysObj["7dayDelay"];
            }
        }
        if(vesselDelaysObj["7dayDelay"] == null && vesselDelaysObj["14dayDelay"] != null) {
            vesselDelaysObj["7dayDelay"] = vesselDelaysObj["14dayDelay"];
        }
        if(vesselDelaysObj["14dayDelay"] == null) {
            vesselDelaysObj["14dayDelay"] = 0;
        }

        let vesselIndex = vesselPortCallDelays.findIndex(vessel => vessel["id"] === vesselId);
        let vesselData;
        if(vesselIndex == -1) {
            vesselData = {
                id: vesselId,
                portDelays: {
                    "2": [ vesselDelaysObj["2dayDelay"] ],
                    "7": [ vesselDelaysObj["7dayDelay"] ],
                    "14": [ vesselDelaysObj["14dayDelay"] ]
                }
            };
            vesselPortCallDelays.push(vesselData);
        } else {
            vesselPortCallDelays[vesselIndex]["portDelays"]["2"].push(vesselDelaysObj["2dayDelay"]);
            vesselPortCallDelays[vesselIndex]["portDelays"]["7"].push(vesselDelaysObj["7dayDelay"]);
            vesselPortCallDelays[vesselIndex]["portDelays"]["14"].push(vesselDelaysObj["14dayDelay"]);
        }
    }

    getVesselPortCallDelaysData() {
        return vesselPortCallDelays;
    }

    /** Function to populate port data from the APIs given
     * It should be called only once to save to-and-fro API calls
     */
    async populatePortData(portData) {
        if(portData !== undefined && portData.length !=0 ) { return portData }
        console.time("Time to populate Port Data");
        var vessels = await vesselAPIServiceObj.readVesselApi();
        if(vessels.length==0) {
            console.log("No vessels found");
            return [];
        }
        let promiseArr=[];
        vessels.forEach( (vessel) => {
            promiseArr.push(vesselAPIServiceObj.getSchedule(vessel.imo));
        })
        const schedules = await Promise.all(promiseArr);
        schedules.forEach( (schedule) => {
            if(schedule != undefined && schedule.hasOwnProperty("portCalls")) {
                schedule.portCalls.forEach( (portCall) => {
                    let portIndex = (portData!== undefined && portData.length > 0) ? portData.findIndex(port => port["id"] === portCall.port.id): -1;
                    let duration = this.getPortCallDuration(portCall.departure, portCall.arrival);
                    //For step 4: calculate vessel port call delay
                    let portCallDelay = this.getPortCallDelay(schedule.vessel.imo, portCall.arrival, portCall.logEntries);
                    if(portIndex != -1) {
                        if(!portCall.isOmitted) {
                            portData[portIndex]["arrivals"]++;
                        }
                        portData[portIndex]["portCallDuration (hours)"].push(duration);
                    } else {
                        let portDetails = {
                            id: portCall.port.id,
                            name: portCall.port.name,
                            arrivals: 0,
                            "portCallDuration (hours)": [duration]
                        };
                        if(!portCall.isOmitted) {
                            portDetails["arrivals"] = 1;
                        }
                        if(portData!== undefined && portData.length > 0) {
                            portData.push(portDetails);
                        } else {
                            portData = [portDetails];
                        }
                    }
                });
            }
        });
        console.timeEnd("Time to populate Port Data");
        return portData;
    }

}

module.exports = PortCallService;