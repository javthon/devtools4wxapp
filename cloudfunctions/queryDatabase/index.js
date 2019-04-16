/**
 * 查询所有数据库名
 * @param host
 * @param user
 * @param password
 * @param type 1:数据库，2:表，3:查询
 */
const cloud = require('wx-server-sdk')
const mysql = require('mysql')
const showDatabasesSql = "SELECT DISTINCT table_schema FROM information_schema.TABLES WHERE table_type = 'BASE TABLE';"
const showTablesSql = "SHOW TABLES;"
cloud.init()


exports.main = async (event, context) => new Promise((resolve, reject) => {
  let connection;
  if (event.type == 1) { //数据库
    connection = mysql.createConnection({
      host: event.host,
      port: event.port,
      user: event.user,
      password: event.password,
      database: "information_schema"
    });

    connection.connect();
    let queryResult;
    connection.query(showDatabasesSql, function (error, results, fields) {
      if (error) result = error;
      queryResult = results
    });
    connection.end();

    setTimeout(() => { //表
      resolve(queryResult)
    }, 500)
    //---------------------------------------------------------------------//
  } else if (event.type == 2) {

    const connection = mysql.createConnection({
      host: event.host,
      port: event.port,
      user: event.user,
      password: event.password,
      database: event.database
    });

    connection.connect();
    let queryResult;
    connection.query(showTablesSql, function (error, results, fields) {
      if (error) result = error;
      queryResult = results
    });
    connection.end();

    setTimeout(() => {
      resolve(queryResult)
    }, 500)
    //---------------------------------------------------------------------//
  } else if (event.type == 3) { //查询
    const connection = mysql.createConnection({
      host: event.host,
      port: event.port,
      user: event.user,
      password: event.password,
      database: event.database
    });

    connection.connect();
    let queryResult;
    connection.query(event.sql, function (error, results, fields) {
      if (error) result = error;

      queryResult = results
    });
    connection.end();

    setTimeout(() => {
      resolve(queryResult)
    }, 500)
  }

})