
Page({

  /**
   * Page initial data
   */
  data: {
    host: "",
    port: "",
    password: "",
    type: 1,
    rememberPass:false,
    resultArray: []
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    wx.getStorage({
      key: 'hasShownReadmeTip',
      success: function (res) {
        //do nothing
      },
      fail: function () {
        wx.navigateTo({
          url: '../readme/readme?fromPage=redis',
        })
      }
    });
    wx.getStorage({
      key: 'rememberPass-redis',
      success: function (res) {
        console.log(res.data)
        if (res.data) {
          if (options.exception==undefined){
            wx.redirectTo({
              url: './redis'
            })
          }
        }
      },
      fail: function () {
        //do nothing
      }
    });
  },

  inputHost: function (e) {
    this.setData({
      host: e.detail.value
    })
  },
  inputPort: function (e) {
    this.setData({
      port: e.detail.value
    })
  },
  
  inputPassword: function (e) {
    this.setData({
      password: e.detail.value
    })
  },
  setDefaultPort: function(){
    this.setData({
      port: '6379'
    })
  },
  

  checkboxChange:function(){
    this.setData({
      rememberPass:!this.data.rememberPass
    });
    console.log(this.data.rememberPass)
  },

  login: function(){
    wx.showLoading({
      title: '正在登录',
    })
    var that = this
    wx.cloud.callFunction({
      name: 'queryRedis',
      data: {
        host: that.data.host,
        port: that.data.port,
        password: that.data.password,
        type: "keys",
        key: "*"
      }
    }).then(res => {
    console.log(res)
      wx.hideLoading()
      if(res.result==null){
        wx.showToast({
          title: '登录失败',
          icon: 'none',
          duration: 2000
        })
      }else{
        var connection = [];
        connection.push(that.data.host);
        connection.push(that.data.port);
        connection.push(that.data.password);
        wx.setStorage({
          key: "connection-redis",
          data: connection
        })
        wx.setStorage({
          key: "rememberPass-redis",
          data: that.data.rememberPass
        })
        wx.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 2000
        })
        setTimeout(() => { //表
          wx.redirectTo({
            url: './redis'
          })
        }, 1000)
        
      }

    })
  },

})