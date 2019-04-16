
var app = getApp();
Page({

  /**
   * Page initial data
   */
  data: {
    redisKeyArray: "",
    currentKeyArray: "",
    currentKeyString:"",
    host: "",
    port: "",
    type: "",
    password: "",
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    var that = this;
    if (options.ip != undefined) {
      that.setData({
        host: options.ip,
        port: options.port,
        password: options.password,
      })
      var connection = [];
      connection.push(that.data.host);
      connection.push(that.data.port);
      connection.push(that.data.password);
      wx.setStorage({
        key: "connection-redis",
        data: connection
      })
      that.getAllKeys();
    }else{
      wx.getStorage({
        key: 'connection-redis',
        success: function (res) {
          that.setData({
            host: res.data[0],
            port: res.data[1],
            password: res.data[2],
          })
          that.getAllKeys();
        },
        fail: function () {
          wx.redirectTo({
            url: './login?exception=true'
          })
        }
      });
    }

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
      newKey: "",
      result:""
    })
  },
  saveData: function () {
    var that = this;
    if (that.data.newKey == "") {
      wx.showToast({
        title: 'key不能为空哦',
        icon: 'none',
        duration: 2000
      })
      return false
    }
    wx.showLoading({
      title: '正在执行',
    })
    
    wx.cloud.callFunction({
      name: 'queryRedis',
      data: {
        host: that.data.host,
        port: that.data.port,
        type: "set",
        password: that.data.password,
        key: that.data.newKey,
        value: that.data.result
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
        that.getAllKeys();
      } else {
        wx.showToast({
          title: '更新失败请重试',
          icon: 'none',
          duration: 1000
        })
      }

      that.setData({
        inputVisible: false,
        newKey: "",
        result: ""
      })

    })
    
  },
  inputData: function (e) {
    this.setData({
      result: e.detail.value
    })
  },
  getValue: function (e) {
    var dataset = e.currentTarget.dataset;
    var key = dataset.key;
    var tempCurrentKeyString = this.data.currentKeyString;
    if(key.indexOf(">")!=-1){
      key=key.substring(1);
      tempCurrentKeyString+=key;
      tempCurrentKeyString+=":";
      var tempCurrentKeyArray = [];
      var tempSet = new Set();
      for (var i = 0; i < this.data.redisKeyArray.length;i++){
        var tempIndex = this.data.redisKeyArray[i].indexOf(tempCurrentKeyString);
        if (tempIndex!=-1){
          var newString = this.data.redisKeyArray[i].substring(tempCurrentKeyString.length);
          var colonIndex = newString.indexOf(":")
          if (colonIndex != -1) {
            tempSet.add(">" + newString.substring(0, colonIndex));
          } else {
            tempSet.add(newString)
          }
          
        }
      }
      for (let item of tempSet.keys()) {
        tempCurrentKeyArray.push(item)
      }
      this.setData({
        currentKeyArray: tempCurrentKeyArray,
        currentKeyString: tempCurrentKeyString
      })
    }else{
      //直接跳转值
      wx.navigateTo({
        url: './result?key=' + tempCurrentKeyString+key
      })
    }
    
  },

  returnLast:function(){
    console.log(this.data.currentKeyString)
    var occurTimes = (this.data.currentKeyString.split(':')).length - 1
    console.log(occurTimes)
    if(occurTimes==1){
      wx.showLoading({
        title: '正在刷新',
      })
      this.getAllKeys();
      this.setData({
        currentKeyString: ''
      })
      setTimeout(() => { //表
        wx.hideLoading();
      }, 1000)
     
    }else{
      var index = this.find(this.data.currentKeyString, ":", occurTimes - 2)

      let tempCurrentKeyString = this.data.currentKeyString.substring(0, index + 1)
      console.log(tempCurrentKeyString + "----")
      this.setData({
        currentKeyString: tempCurrentKeyString
      })



      var tempCurrentKeyArray = [];
      var tempSet = new Set();
      for (var i = 0; i < this.data.redisKeyArray.length; i++) {
        var tempIndex = this.data.redisKeyArray[i].indexOf(tempCurrentKeyString);

        if (tempIndex != -1) {
          console.log("index:" + tempIndex)
          var newString = this.data.redisKeyArray[i].substring(tempCurrentKeyString.length);
          var colonIndex = newString.indexOf(":")
          if (colonIndex != -1) {
            tempSet.add(">" + newString.substring(0, colonIndex));
          } else {
            tempSet.add(newString)
          }

        }
      }
      for (let item of tempSet.keys()) {
        tempCurrentKeyArray.push(item)
      }
      this.setData({
        currentKeyArray: tempCurrentKeyArray,
        currentKeyString: tempCurrentKeyString
      })
    }
    
  },
  find:function (str, cha, num){
    var x = str.indexOf(cha);
      for(var i = 0; i<num;i++){
        x = str.indexOf(cha, x + 1);
      }
      return x;
  },

  logout: function () {
    wx.removeStorage({
      key: 'connection-redis',
      success(res) {
        console.log(res.data)
      }
    })
    wx.setStorage({
      key: "rememberPass-redis",
      data: false
    })
    wx.redirectTo({
      url: './login'
    })
  },
  getAllKeys: function () {
    var that = this
    wx.cloud.callFunction({
      name: 'queryRedis',
      data: {
        host: that.data.host,
        port: that.data.port,
        type: "keys",
        password: that.data.password,
        key: "*",
      }
    }).then(res => {
      if (res.result == null) {
        wx.showModal({
          content: 'Redis连接信息已改变或发生未知网络错误，请重新登录',
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
        redisKeyArray: res.result
      })
      var tempSet=new Set();
      var tempCurrentKeyArray=[];
      for(var i=0;i<res.result.length;i++){
        var colonIndex = res.result[i].indexOf(":")
        if (colonIndex!=-1){
          tempSet.add(">"+res.result[i].substring(0, colonIndex));
        }else{
          tempSet.add(res.result[i])
        }
      }


      for (let item of tempSet.keys()) {
        tempCurrentKeyArray.push(item)
      }
      that.setData({
        currentKeyArray: tempCurrentKeyArray
      })

      console.log(res.result)
      console.log(tempSet)

    })
  }


})