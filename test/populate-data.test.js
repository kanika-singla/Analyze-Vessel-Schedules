require("dotenv").config();
const vesselAPIService = require("../services/VesselAPIService");
const vesselAPIServiceObj = new vesselAPIService();

const portCallService = require("../services/PortCallService");
const portCallServiceObj = new portCallService();

describe("Populating data from API", () => {

  test("Able to read Vessels API", async () => {
    const response = await vesselAPIServiceObj.readVesselApi();
    expect(response.length).toBe(12);
  });

  test("Populating Port Data", async () => {
    const portData = await portCallServiceObj.populatePortData();
    expect(portData.length).toBe(69);
  });

});
