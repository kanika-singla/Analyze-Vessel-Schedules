require("dotenv").config();
const vesselControllerClass = require("../controllers/VesselController.js");
const vesselControllerObj = new vesselControllerClass();

describe("Populating data from API", () => {
    
    test("Get most arrivals", async() => {
        let mostArrivals = await vesselControllerObj.getMostArrivals();
        expect(mostArrivals.length).toBe(5);
        expect(mostArrivals).toEqual(          
            expect.arrayContaining([      
              expect.objectContaining({   
                id: 'DEHAM'               
              })
            ])
        );
        expect(mostArrivals).toEqual(          
            expect.arrayContaining([      
              expect.objectContaining({   
                id: 'BEANR'               
              })
            ])
        );
    });

    test("Get least port calls", async() => {
        let leastPortCalls = await vesselControllerObj.getLeastPortCalls();
        expect(leastPortCalls.length).toBe(5);
        expect(leastPortCalls).toEqual(          
            expect.arrayContaining([      
              expect.objectContaining({   
                id: 'DEBRV'               
              })
            ])
        );
        expect(leastPortCalls).toEqual(          
            expect.arrayContaining([      
              expect.objectContaining({   
                id: 'ITCAG'               
              })
            ])
        );
    });

    test("Get port calls percentiles", async() => {
        let portCallPercentiles = await vesselControllerObj.getPercentilePortCallDuration();
        expect(portCallPercentiles.length).toBe(69);
    });

    test("Get vessel port calls delays", async() => {
        let vesselPortCallDelays = await vesselControllerObj.getVesselPercentiles();
        expect(vesselPortCallDelays.length).toBe(12);
    });

});
