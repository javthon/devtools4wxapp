
Page({

  /**
   * Page initial data
   */
  data: {
    tableArray: [],
    database:''
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    var that=this;
    wx.getStorage({
      key: 'connection',
      success: function (res) {
        that.setData({
          host: res.data[0],
          port: res.data[1],
          user: res.data[2],
          password: res.data[3],
          database: options.name
        })
        that.queryDatabase();
      },
      fail: function () {
        wx.navigateTo({
          url: './login'
        })
      }
    });


  },

  showTables: function (e) {
    var that=this;
    var dataset = e.currentTarget.dataset;
    var table = dataset.table;
    console.log(table)
    wx.navigateTo({
      url: './recordList?table=' + table + "&database=" + that.data.database
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
        database: that.data.database,
        type: 2,
      }
    }).then(res => {
      console.log(res)
      if (res.result == null || res.result==[]) {
        wx.showModal({
          content: '网络异常请重试',
          confirmText: "确认",
          cancelText: "取消",
          success: function (res) {
            wx.navigateBack({
              delta: 1
            })
          },
          fail: function (res) {
            wx.navigateBack({
              delta: 1
            })
          }
        });
      }
      that.setData({
        tableArray: res.result
      })
      console.log(res)
     

      }).catch(err => {
        wx.showModal({
          content: '网络异常请重试',
          confirmText: "确认",
          cancelText: "取消",
          success: function (res) {
            wx.navigateBack({
              delta: 1
            })
          },
          fail: function (res) {
            wx.navigateBack({
              delta: 1
            })
          }
        });
      })
  }

})