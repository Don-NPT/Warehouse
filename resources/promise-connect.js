const mysql = require('promise-mysql');

const dbConfig = {
    host: "localhost",
    user: "itcs212",
    password: "itcs212",
    database: "wearhouse"
   }
// Create a connection to DB
module.exports = async()=>{
    try {
        let pool = await mysql.createPool(dbConfig);
        let connection = pool.getConnection();
        return connection;
    } 
    catch (error) {
        throw error;
    }
   }