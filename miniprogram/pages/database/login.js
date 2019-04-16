
Page({

  /**
   * Page initial data
   */
  data: {
    host: "",
    port: "",
    user: "",
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
          url: '../readme/readme?fromPage=database',
        })
      }
    });
    wx.getStorage({
      key: 'rememberPass',
      success: function (res) {
        console.log(res.data)
        if (res.data) {
          if (options.exception==undefined){
            wx.redirectTo({
              url: './databaseList'
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
  inputUser: function (e) {
    this.setData({
      user: e.detail.value
    })
  },
  inputPassword: function (e) {
    this.setData({
      password: e.detail.value
    })
  },
  setDefaultPort: function(){
    this.setData({
      port: '3306'
    })
  },
  setDefaultUser: function(){
    this.setData({
      user: 'root'
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
      name: 'queryDatabase',
      data: {
        host: that.data.host,
        port: that.data.port,
        user: that.data.user,
        password: that.data.password,
        type: 1,
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
        connection.push(that.data.user);
        connection.push(that.data.password);
        wx.setStorage({
          key: "connection",
          data: connection
        })
        wx.setStorage({
          key: "rememberPass",
          data: that.data.rememberPass
        })
        wx.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 2000
        })
        setTimeout(() => { //表
          wx.redirectTo({
            url: './databaseList'
          })
        }, 1000)
        
      }

    })
  },

})