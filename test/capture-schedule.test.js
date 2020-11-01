//require("dotenv").config();
const vesselController = require("../controllers/VesselController");
const vesselControllerObj = new vesselController();

describe("Vessels API", () => {

  test("Able to read Vessels API", async () => {
    const response = await vesselControllerObj.readVesselApi();
    expect(response.length).toBe(12);
  });

});
