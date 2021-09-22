const config = require("./config");

const { port } = config;
const app = require("./app");

const checkDbConnection = require("./src/utilities/mysql_db");
checkDbConnection();

app.listen(port, () => {
  console.log(`Running Maping API on port ${port}`);
});
