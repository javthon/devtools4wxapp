const cloud = require('wx-server-sdk')
const mysql = require('mysql')
cloud.init()


exports.main = (event, context) => new Promise((resolve, reject) => {
  let connection;
  connection = mysql.createConnection({
    host: event.host,
    user: event.user,
    password: event.password,
    database: event.database
  });
   let sql="INSERT INTO "+event.table+" SET ?";
    connection.connect();
    let queryResult;
    connection.query(sql,event.args,function (error, results) {
      if (error) result = error;
      queryResult = results
    });
    connection.end();

    setTimeout(() => { //表
      resolve(queryResult)
    }, 500)
  
  
})