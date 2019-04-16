
Page({

  /**
   * Page initial data
   */
  data: {
    host: "",
    port: "",
    user: "",
    password: "",
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    var that=this;
    wx.getStorage({
      key: 'hasShownReadmeTip',
      success: function (res) {
        //do nothing
      },
      fail: function () {
        wx.navigateTo({
          url: '../readme/readme?fromPage=linux',
        })
      }
    });
    wx.getStorage({
      key: 'connectionLinux',
      success: function (res) {
        that.setData({
          host: res.data[0],
          port: res.data[1],
          user: res.data[2],
        })
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
      port: '22'
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
      name: 'execLinuxShell',
      data: {
        "host": that.data.host,
        "port": that.data.port,
        "user":that.data.user,
        "password": that.data.password,
        "bash": "",
        "session": "123"
      }
    }).then(res => {

      console.log(res)
      if(res.result==null){
        wx.showToast({
          title: '登录失败',
          icon: 'none',
          duration: 2000
        })
        wx.hideLoading();
        return false;
      }
      if (res.result == '') {
        wx.showToast({
          title: '登录失败',
          icon: 'none',
          duration: 2000
        })
        wx.hideLoading();
        return false;
      }
      var connectionLinux = [];
      connectionLinux.push(that.data.host);
      connectionLinux.push(that.data.port);
      connectionLinux.push(that.data.user);
      wx.setStorage({
        key: "connectionLinux",
        data: connectionLinux
      })
      wx.hideLoading();
      wx.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 2000
      })
      wx.navigateTo({
        url: './linux?host=' + that.data.host + "&port=" + that.data.port + "&user=" + that.data.user + "&password=" + that.data.password,
      })
    }).catch(err => {
      console.log(err)
      wx.hideLoading();
      wx.showToast({
        title: '登录失败',
        icon: 'none',
        duration: 2000
      })
    })
  },

})