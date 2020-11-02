# Analyze-Vessel-Schedules

This is a tool to import vessel schedules from an external data source and display interesting statistics about these schedules.

### Technologies Used:
* Javascript, NodeJS (Runtime environment)
* Express framework
* NodeJS libraries:
  * axios
  * percentiles
  * dotenv

### Pre-requisites
* NodeJS installed (^12.18.3)
* Basic understanding of running npm/node commands.

### Setup:
1. Clone the GitHub repository to your system.
2. Run `npm install` from command-line.
3. Create `.env` file and include API urls, port details like below:
```
port=5000
vesselsAPI=""
scheduleAPI=""
```
4. Run `npm start`

### Statistics
- The top 5 ports with the most arrivals, and the corresponding number of total port calls for each port. Arrivals means the vessel *actually* stopped at the port [*isOmtted* flag is set to false]
> Endpoint: "http://localhost:5000/mostArrivalsPort"
- The top 5 ports that have the fewest port calls, and the number of total port calls for each port. 
> Endpoint: "http://localhost:5000/leastPortCalls"
- For each port, the percentiles of port call durations: 5th, 20th, 50th, 75th and 90th percentiles. 
> Endpoint: "http://localhost:5000/portPercentiles"
- For each vessel, calculate the 5th, 50th and 80th percentiles for the port call delay when the vessel is 14, 7 and 2 days from arrival.
> Endpoint: "http://localhost:5000/vesselPercentiles"
