
var app = getApp();
Page({

  /**
   * Page initial data
   */
  data: {
    databaseArray: "",
    host: "",
    port: "",
    user: "",
    password: "",
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    var that = this;
    if(options.ip!=undefined){
      that.setData({
        host: options.ip,
        port: options.port,
        user: options.user,
        password: options.password,
      })
      var connection = [];
      connection.push(that.data.host);
      connection.push(that.data.port);
      connection.push(that.data.user);
      connection.push(that.data.password);
      wx.setStorage({
        key: "connection",
        data: connection
      })
      that.queryDatabase();
    }else{  
        wx.getStorage({
          key: 'connection',
          success: function (res) {
          that.setData({
            host: res.data[0],
            port: res.data[1],
            user: res.data[2],
            password: res.data[3],
          })
          that.queryDatabase();
        },
        fail: function () {
          wx.redirectTo({
            url: './login?exception=true'
          })
        }
      });
    }
    
  },

  showTables: function(e){
    var dataset = e.currentTarget.dataset;
    var name = dataset.name;
    console.log(name)
    wx.navigateTo({
      url: './tableList?name='+name
    })
  },

  logout:function(){
    wx.removeStorage({
      key: 'connection',
      success(res) {
        console.log(res.data)
      }
    })
    wx.setStorage({
      key: "rememberPass",
      data: false
    })
    wx.redirectTo({
      url: './login'
    })
  },
  queryDatabase: function () {
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
      if(res.result==null){
        wx.showModal({
          content: '数据库连接信息已改变或发生未知网络错误，请重新登录',
          confirmText: "确认",
          cancelText: "取消",
          success: function (res) {
            wx.redirectTo({
              url: './login?exception=true'
            })
          },
          fail: function (res) {
            wx.redirectTo({
              url: './login?exception=true'
            })
          }
        });
      }

      that.setData({
        databaseArray: res.result
      })

    })
  }


})