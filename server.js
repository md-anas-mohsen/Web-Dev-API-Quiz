require("dotenv").config({ path: "./.env" });
require("./config/database");
const server = require("./app");

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
