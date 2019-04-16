String.prototype.replaceAll = function (FindText, RepText) {
  return this.replace(new RegExp(FindText, "g"), RepText);
}
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
   
  },

  jumpToRedis:function(e){
    var redis = e.currentTarget.dataset.redis;
    var split=redis.split(",");
    wx.navigateTo({
      url: '../redis/redis?ip='+split[0]+"&port="+split[1]+"&password="+split[2],
    })
  },
  jumpToMysql: function (e) {
    var mysql = e.currentTarget.dataset.mysql;
    var split = mysql.split(",");
    wx.navigateTo({
      url: '../database/databaseList?ip=' + split[0] + "&port=" + split[1] + "&user="+split[2]+"&password=" + split[3],
    })
  },

})