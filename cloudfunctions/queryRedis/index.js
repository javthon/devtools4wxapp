// 云函数入口文件
const cloud = require('wx-server-sdk')
var redis = require('redis')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => new Promise((resolve, reject) => {
  var result;
  client = redis.createClient(event.port, event.host, event.opts);
  client.auth(event.password)
  if(event.type=='get'){
    client.get(event.key, function (err, reply) {
      console.log(reply)
      result = reply
    })
  }

  if (event.type == 'keys') {
    client.keys(event.key, function (err, reply) {
      console.log(reply)
      result = reply
    })
  }

  if (event.type == 'del') {
    client.del(event.key, function (err, reply) {
      console.log(reply)
      result = reply
    })
  }

  if (event.type == 'set') {
    client.set(event.key, event.value, function (err, reply) {
      console.log(reply)
      result = reply
    })
  }

  if (event.type == 'rename') {
    client.rename(event.oldkey, event.newkey,function (err, reply) {
      console.log(reply)
      result = reply
    })
  }
  
  

  setTimeout(() => {
    resolve(result)
  }, 500)
})