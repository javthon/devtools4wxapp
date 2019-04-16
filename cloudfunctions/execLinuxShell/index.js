const cloud = require('wx-server-sdk')
var Client = require('ssh2').Client;
const sessionMap = new Map()


cloud.init()


exports.main = (event, context) => new Promise((resolve, reject) => {
  var result = '';
  let bash = event.bash;
  var conn = new Client();
  console.log("conn是：----" + conn)
  conn.on('ready', function () {
    conn.shell(function (err, stream) {
      if (err) throw err;
      stream.on('close', function () {
        console.log('Stream :: close');
        conn.end();
      }).on('data', function (data) {
        result += data;
        console.log('----------------------------: ' + data);
      });
      stream.write(event.bash + "\n");
      stream.write("pwd\n");
    });
  }).connect({ 
    host: event.host,
    port: event.port,
    username: event.user,
    password: event.password,
    keepaliveInterval: 1000 * 60 * 30
  });



  setTimeout(() => {
    resolve(result)
  }, 1000)
})