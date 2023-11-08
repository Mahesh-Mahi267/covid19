const express = require("express");
const path = require("path");
const {open} = require("sqlite");
const sqlite3 = require("sqlite3");
const databasePath = path.join(__dirname, "covid19India.db");
const app = express();
app.use(express.json());
let database = null;

const initializeDbAndServer = async () => {
try {
database = await open ({
filename:databasePath,
driver:sqlite3.Database,
});
app.listen(3000, () =>
console.log("Server Running at http://localhost:3000/");

);
} catch (error) {
console.log(`DB Error: ${error.message}`);
process.exit(1);
}
};

initializeDbAndServer();


const convertStateObjectToResponseObject = (dbObject) => {
return {
stateId:dbObject.state_id,
stateName:dbObject.state_Name,
population:dbObject.population,
};
};

const convertDistrictObjectToResponseObject = (dbObject) => {
return {
districtId:dbObject.district_id,
districtName:dbObject.district_name,
stateId:dbObject.state_id,
cases:dbObject.cases,
cured:dbObject.cured,
active:dbObject.active,
deaths:dbObject.deaths,
};
};

app.get("/states/", async (request, response) => {
const getStateQuery = `
SELECT
*
FROM
state
ORDER BY
state_id`;

const stateArray = await database.all(getStateQuery);
response.send(stateArray.map((eachState)=>
convertStateObjectToResponseObject(eachState)
)
);
});

app.get("/states/:stateId/", async (request, response) => {
const {statesId} = request.params;
const getStateQuery = `
SELECT
*
FROM
state
WHERE
state_id = ${stateId};`;
const stateArray = await database.get(getStateQuery);
response.send(convertStateObjectToResponseObject(stateArray));
});

app.post("/districts/", async (request, response) => {
const {districtName, stateId, cases, cured, active, deaths} = request.body;
const postDistrictQuery = `
INSERT INTO
district (district_name, state_id, cases, cured, active, deaths);
VALUES ('${districtName}', ${stateId}, ${cases}, ${cured}, ${active}, ${deaths});`;
await database.run(postDistrictQuery);
response.send("District Successfully Added");
});

app.get("/districts/:districtId/", async (request, response)=> {
const {districtId} = request.params;
const getDistrictQuery = `
SELECT
*
FROM
DISTRICT
WHERE
district_id = ${districtId};`;
const districtArray = await database.get(getDistrictArray);
response.send(convertDistrictObjectToResponseObject(districtArray));
});

app.delete("/districts/:districtId/", async (request, response)=> {
const {districtId} = request.params;
const deleteDistrictQuery=`
DELETE FROM
district
WHERE
district_id = ${districtId};`;
await database.run(deleteDistrictQuery);
response.send("District Removed");
});

app.put("/districts/:districtId/", async (request, params)=> {
const {districtId} = request.params;
const {districtName, stateId, cases, cured, active, deaths} = request.body;
const putDistrictQuery = `
UPDATE
district
SET
district_name='${districtName}',
state_id=${stateId},
cases=${cases},
cured=${cured},
active=${active},
deaths=${deaths}
WHERE
district_id = ${districtId};`;

await database.run(putDistrictQuery);
response.send("District Details Updated");
});

app.get("/states/:stateId/stats/", async (request, response)=>{
const {stateId} = request.params;
const getDistrictStateQuery = `
SELECT
SUM(cases) As totalCases,
SUM(cured) As totalCured,
SUM(active) As totalActive,
SUM(deaths) As totalDeaths
FROM
district
WHERE
state_id = ${stateId};`;
const stateArray = await database.get(getDistrictStateQuery);
response.send(stateArray);
});

app.get("/districts/:districtId/details/", async (request, response)=> {
const {districtId} = request.params;
const getDistrictQuery = `
Select state_id from district
WHERE
district_id = ${districtId};`;
const districtArray = await database.get(getDistrictQuery);
const getStateNameQuery = `
SELECT state_name as stateName from state
WHERE state_id = ${districtArray.state_id};`;
const getStateNameQueryResponse = await database.get(getStateNameQuery);
response.send(getStateNameQueryResponse);
});
module.exports = app;