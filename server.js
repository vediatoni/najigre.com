const server = require("./app").app
const PORT = process.argv[2] || 3000

server.listen(PORT)

console.log("Listening on port " + PORT)