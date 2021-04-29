const dbConnection = require('../resources/promise-connect');
const result = require('../routers/result-router');
class ResultMng{ 
    async getAllProduct(){
        // Get the connection
        let connection = await dbConnection();
        try {
            let sql = "SELECT * FROM product";
            let results = await connection.query(sql);
            return results;
        } 
        catch (error) {
            throw error;
        } 
    }
    /* More SQL Methods here */
    async getProduct(query){
        // Get the connection
        //query = "'"+ query + "'";
        console.log('get '+ query);
        let connection = await dbConnection();
        try {
            let sql = 'SELECT * FROM product where Pid=? or Pname LIKE ? or price<?';
            //let sql = "SELECT * FROM product";
            let results = await connection.query(sql, [query, '%'+query+'%', query]);
            return results;
        } 
        catch (error) {
            throw error;
        } 
    }
}
module.exports.ResultMng = ResultMng;