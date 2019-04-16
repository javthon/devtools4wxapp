//index.js
//获取应用实例
const app = getApp()
var index = 0;
Page({
  data: {
  
  },

  jumpCalculator:function(e){
    console.log(e)
    wx.navigateToMiniProgram({
      appId: 'wxf5ccb7793b84ce19',
      path: 'pages/index/index',
      envVersion: 'release',
  
      success(res) {
        // 打开成功
        console.log(res)
      },
      fail(res){
        console.log(res)
      }
    })
  },
  jumpLab:function(e){
    wx.navigateTo({
      url: '../lab/lab'
    })
  },
  jumpDatabase: function (e) {
    wx.navigateTo({
      url: '../database/login'
    })
  },
  jumpRedis: function (e) {
    wx.navigateTo({
      url: '../redis/login'
    })
  },

  jumpLinux: function (e) {
    wx.navigateTo({
      url: '../linux/login'
    })
  },


  plsWait: function (e) {
    wx.showToast({
      title: '敬请期待',
      icon: 'none',
      duration: 2000
    })
  },

  jumpAPI: function (e) {
    // wx.navigateTo({
    //   url: './documents'
    // })
    wx.navigateToMiniProgram({
      appId: 'wx0033f6ea238e305c',
      path: 'pages/index/index',
      envVersion: 'release',

      success(res) {
        // 打开成功
        console.log(res)
      },
      fail(res) {
        console.log(res)
      }
    })
  },

  jumpIntroduction: function (e) {
    wx.navigateTo({
      url: './introduction'
    })
  },

})
