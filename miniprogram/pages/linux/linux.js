String.prototype.replaceAll = function (FindText, RepText) {
  return this.replace(new RegExp(FindText, "g"), RepText);
}
Page({

  /**
   * Page initial data
   */
  data: {
    result:"",
    prefixBash:"",
    bash:"",
    "host": "",
    "port": "",
    "user": "",
    "password": "",
    scrollTop: 0,
    lastPath:""
  },

 
  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    var that=this;
    that.setData({
      "host": options.host,
      "port": options.port,
      "user": options.user,
      "password": options.password,
    })
    wx.cloud.callFunction({
      name: 'execLinuxShell',
      data: {
        "host": options.host,
        "port": options.port,
        "user": options.user,
        "password": options.password,
        "bash": "",
        "session":"123"
      }
    }).then(res => {

      var tempResult = res.result.replace("/01/g","xxx").replace("/34me/g","xxx");

      console.log("tempresult is:--"+tempResult)
      var firstpwdIndex = tempResult.indexOf("pwd")
      var lastpwdIndex = tempResult.lastIndexOf("pwd")
      var lastCommandBeginIndex = tempResult.lastIndexOf("[")
      var abosulutePath = tempResult.substring(lastpwdIndex+5, lastCommandBeginIndex-2) //linux绝对路径
      console.log("pwd is:"+abosulutePath)
      that.setData({
        prefixBash: "cd " + abosulutePath+"&&",
        result: res.result.substring(0, firstpwdIndex - 1) + res.result.substring(lastCommandBeginIndex-1),
        lastPath:abosulutePath
      })

      }).catch(err => {
        console.log(err)
      })
  
  },

  inputBash: function (e) {
    if (e.detail.value.indexOf("\n")!=-1){
      this.sendBash()
    }else{
      this.setData({
        bash: e.detail.value
      })
    }
    
  },

  sendBash:function(){
    
    var that = this;
    var hasLS=false
    if (that.data.bash.indexOf("ls") != -1) {
      hasLS=true
    }
    console.log("prefexbash:"+that.data.prefixBash + ",bash:"+that.data.bash)
    wx.cloud.callFunction({
      name: 'execLinuxShell',
      data: {
        "host": that.data.host,
        "port": that.data.port,
        "user": that.data.user,
        "password": that.data.password,
        "bash": that.data.prefixBash+that.data.bash,
        "session": "123"
      }
    }).then(res => {

      var tempResult = res.result;
      var lastpwdIndex = tempResult.lastIndexOf("pwd")
      var lastCommandBeginIndex = tempResult.lastIndexOf("[")
      var abosulutePath = tempResult.substring(lastpwdIndex + 5, lastCommandBeginIndex-2) //linux绝对路径
      console.log("pwd is:" + abosulutePath)
      
      if (abosulutePath.indexOf("命令已在后台运行") == -1 && abosulutePath.indexOf("Last") == -1 && abosulutePath.indexOf("\n") == -1){
        that.setData({
          prefixBash: "cd " + abosulutePath + "&&",
          lastPath: abosulutePath
        })
      }else{
        that.setData({
          prefixBash: "cd " + that.data.lastPath + "&&"
        })
      }
      
      var first = tempResult.indexOf("[");
      tempResult = tempResult.substring(first, lastpwdIndex).replaceAll("\\[01;34m", "").replaceAll("\\[01;31m", "").replaceAll("\\[01;32m", "").replaceAll("\\[0m", "").replaceAll("", "").replaceAll("wd","命令已在后台运行")//去掉颜色乱码
      var andBegin = tempResult.indexOf("&&");
      tempResult = tempResult.substring(andBegin+2)
      console.log(tempResult)

      if (hasLS){
        tempResult = "ls" + tempResult.substring(3)
      }
      
      that.setData({
        result: that.data.result+tempResult,
        scrollTop: that.data.scrollTop + 10000,
      })
      
     

    })

   

    that.setData({
      bash:""
    })
  },

  reset: function () {
    var that = this;
    wx.showActionSheet({
      itemList: ['重新登录'],
      success: function (res) {
        if(res.tapIndex==0){
          wx.showLoading({
            title: '正在登录',
          })
          wx.cloud.callFunction({
            name: 'execLinuxShell',
            data: {
              "host": that.data.host,
              "port": that.data.port,
              "user": that.data.user,
              "password": that.data.password,
              "bash": "",
              "session": "123"
            }
          }).then(res => {

            var tempResult = res.result.replace("/01/g", "xxx").replace("/34me/g", "xxx");

            console.log("tempresult is:--" + tempResult)
            var firstpwdIndex = tempResult.indexOf("pwd")
            var lastpwdIndex = tempResult.lastIndexOf("pwd")
            var lastCommandBeginIndex = tempResult.lastIndexOf("[")
            var abosulutePath = tempResult.substring(lastpwdIndex + 5, lastCommandBeginIndex - 2) //linux绝对路径
            console.log("pwd is:" + abosulutePath)
            that.setData({
              prefixBash: "cd " + abosulutePath + "&&",
              result: res.result.substring(0, firstpwdIndex - 1) + res.result.substring(lastCommandBeginIndex - 1),
              lastPath: abosulutePath
            })
            wx.hideLoading();
          }).catch(err => {
            result: "未知错误，请重新登录"
            wx.hideLoading();
          })
        }

      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
    
    
  },
  


})