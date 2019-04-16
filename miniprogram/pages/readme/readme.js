
Page({

  /**
   * Page initial data
   */
  data: {

  },


  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    this.setData({
      fromPage:options.fromPage
    })

  },

goback:function(){
  wx.navigateTo({
    url: '../index/index',
  })
},
  goon:function(){
    wx.setStorage({
      key: "hasShownReadmeTip",
      data: "true"
    })
    if(this.data.fromPage=="linux"){
      wx.navigateTo({
        url: '../linux/login',
      })
    } else if (this.data.fromPage == "database"){
      wx.navigateTo({
        url: '../database/login',
      })
    } else if (this.data.fromPage == "redis"){
      wx.navigateTo({
        url: '../redis/login',
      })
    }
    
  }


})