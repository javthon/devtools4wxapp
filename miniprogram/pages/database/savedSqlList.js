String.prototype.replaceAll = function (FindText, RepText) {
  return this.replace(new RegExp(FindText, "g"), RepText);
}
Page({

  /**
   * Page initial data
   */
  data: {
   savedSqls:[],
   database:'',
   table:''
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    var that=this;
    that.setData({
      database:options.database,
      table:options.table
    })
    wx.getStorage({
      key: 'savedSqls',
      success: function (res) {
        console.log(res.data)
        that.setData({
          savedSqls:res.data
        })
       
      },
      fail: function () {
        console.log("fail")
      }
    });
  },

  chooseSql:function(e){
    var sql = e.currentTarget.dataset.sql;
    sql = sql.replaceAll("=", "@").replaceAll("%*%", "&") 
    console.log("jumpsql"+sql)
    wx.navigateTo({
      url: './recordList?from=savedSqlList&savedSql=' + sql+"&database="+this.data.database+"&table="+this.data.table
    })
  },

  deleteSql:function(e){
    var that=this;
    var index = e.currentTarget.dataset.index;
    var tempSqls=that.data.savedSqls;
    tempSqls.splice(index,1);
    that.setData({
      savedSqls:tempSqls
    })

    wx.setStorage({
      key: "savedSqls",
      data: tempSqls
    })
    wx.showToast({
      title: '删除成功',
      icon: 'success',
      duration: 1000
    })
  }
  


})