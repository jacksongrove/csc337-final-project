require('dotenv').config(); // Load .env variables

// default values (in the event that .env is missing)
const config = {
  mongoUrl: process.env.MONGO_URL || "mongodb://0.0.0.0:27017/my_db_name",
  port: process.env.PORT || 3000,
  host: process.env.HOST || "0.0.0.0",
};

// Log the loaded environment variables. This helps with determining what is
// loaded (what port to use, what host to use, what the path of the mongodb server is)
console.log(process.env);

module.exports = config;
