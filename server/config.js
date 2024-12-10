require('dotenv').config(); // Load .env variables
console.log(process.env);

// default values
const config = {
  mongoUrl: process.env.MONGO_URL || "mongodb://0.0.0.0:27017/my_db_name",
  port: process.env.PORT || 3000,
  host: process.env.HOST || "0.0.0.0",
};

module.exports = config;
