
var app = getApp();
Page({

  /**
   * Page initial data
   */
  data: {
    redisKeyArray: "",
    currentKeyArray: "",
    currentKeyString: "",
    host: "",
    port: "",
    type: "",
    password: "",
    inputVisible: false,
    newKey:""
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

    var that = this;
    wx.getStorage({
      key: 'connection-redis',
      success: function (res) {
        that.setData({
          host: res.data[0],
          port: res.data[1],
          password: res.data[2],
          key: options.key
        })
        that.getResult();

      },
      fail: function () {
        wx.redirectTo({
          url: './login?exception=true'
        })
      }
    });

    
  },

  showInput: function () {
    this.setData({
      inputVisible: true
    })
  },
  inputNewKey: function (e) {
    this.setData({
      newKey: e.detail.value
    })
  },
  cancelSave: function () {
    this.setData({
      inputVisible: false,
      newKey: ""
    })
  },
  inputData: function (e) {
    this.setData({
      result: e.detail.value
    })
  },
  deleteData:function(){
    var that = this;
    wx.showModal({
      content: '确认删除选中key？',
      confirmText: "确认",
      cancelText: "取消",
      success: function (res) {
        if (res.confirm == true) {
          wx.showLoading({
            title: '正在执行',
          })

          wx.cloud.callFunction({
            name: 'queryRedis',
            data: {
              host: that.data.host,
              port: that.data.port,
              type: "del",
              password: that.data.password,
              key: that.data.key,
            }
          }).then(res => {
            console.log(res)
            var result = res.result;
            wx.hideLoading();
            if (result == 1) {
              wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 2000
              })

              wx.redirectTo({
                url: './redis',
              })
            } else {
              wx.showToast({
                title: '删除失败请重试',
                icon: 'none',
                duration: 2000
              })
            }

          })

        }
      }
    });
    
  },
  updateData:function(){
    wx.showLoading({
      title: '正在执行',
    })
    var that=this;
    wx.cloud.callFunction({
      name: 'queryRedis',
      data: {
        host: that.data.host,
        port: that.data.port,
        type: "set",
        password: that.data.password,
        key: that.data.key,
        value:that.data.result
      }
    }).then(res => {
      console.log(res)
      var result = res.result;
      wx.hideLoading();
      if(result=="OK"){
        wx.showToast({
          title: '更新成功',
          icon: 'success',
          duration: 1000
        })
      }else{
        wx.showToast({
          title: '更新失败请重试',
          icon: 'none',
          duration: 1000
        })
      }

    })
  },
  renameData:function(){
    if (this.data.newKey == "") {
      wx.showToast({
        title: 'sql名字不能为空哦',
        icon: 'none',
        duration: 2000
      })
      return false
    }
    wx.showLoading({
      title: '正在执行',
    })
    var that = this;
    wx.cloud.callFunction({
      name: 'queryRedis',
      data: {
        host: that.data.host,
        port: that.data.port,
        type: "rename",
        password: that.data.password,
        oldkey: that.data.key,
        newkey: that.data.newKey
      }
    }).then(res => {
      console.log(res)
      var result = res.result;
      wx.hideLoading();
      if (result == "OK") {
        wx.showToast({
          title: '更新成功',
          icon: 'success',
          duration: 1000
        })
      } else {
        wx.showToast({
          title: '更新失败请重试',
          icon: 'none',
          duration: 1000
        })
      }

    })
  },
  refresh:function(){
    wx.showLoading({
      title: '正在执行',
    })
    this.getResult();
    setTimeout(() => { 
      wx.hideLoading();
    }, 1000)
  },
  getResult: function(){
    
    var that=this;
    console.log(that.data.key)
    wx.cloud.callFunction({
      name: 'queryRedis',
      data: {
        host: that.data.host,
        port: that.data.port,
        type: "get",
        password: that.data.password,
        key: that.data.key,
      }
    }).then(res => {
      console.log(res)
      var result = res.result;
      try{
        result = JSON.stringify(JSON.parse(result), null, 2);
      }catch(e){
        //do nothing
      }
        that.setData({
          result:result
        })

    })
  }

})