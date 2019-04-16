var app = getApp();
var editedDataMap=new Map()
Page({

  /**
   * Page initial data
   */
  data: {

    database: "",
    table:"",
    type: 3,
    sql: "",
    record: "",
    option: "",
    keyColumns:[],
    keyColumnsIndexs:[],
    resultArray: [],

    
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    console.log(options.record)

    var that = this;
    wx.getStorage({
      key: 'connection',
      success: function (res) {
        that.setData({
          host: res.data[0],
          port: res.data[1],
          user: res.data[2],
          password: res.data[3],
          table: options.table,
          database: options.database,
          // sql: "SELECT * FROM " + options.table + " LIMIT 50"
          // database: "test",
          record: JSON.parse(options.record.replaceAll("@", "=")),
          option: options.option,
          keyColumns: JSON.parse(options.keyColumns)
        })
        console.log("keys:" + that.data.keyColumns)
        let columnHeader = [];
        let columnData = [];
        let keyColumnsIndexs=[];
        var index=0;
        for (var key in that.data.record) {
          let columnHeaderItem={};
          let columnDataItem = {};
          let isKey=false
          for (var i = 0; i < that.data.keyColumns.length;i++){
            if (that.data.keyColumns[i]===key){
              isKey=true;
            }
          }
          index++;
          columnHeaderItem.key=key;
          columnHeaderItem.isKey = isKey;
          columnHeader.push(columnHeaderItem);
          columnDataItem.key = that.data.record[key]
          columnDataItem.isKey = isKey;
          columnData.push(columnDataItem);
        }
        if(that.data.option==0){
          for (var i = 0; i < columnData.length;i++){
            columnData[i].key="";
            columnData[i].isKey =false;
          }
        }
        that.setData({
          columnHeader: columnHeader,
          columnData: columnData,
          keyColumnsIndexs: keyColumnsIndexs
        })
        
        console.log(that.data.table)

      },
      fail: function () {
        wx.navigateTo({
          url: './login'
        })
      }
    });

  },

  navigateBack:function(){
    wx.navigateBack({
      delta: 1
    })
  },
  editRecord: function(e){
    let value = e.detail.value
    let index = e.currentTarget.dataset.value
    editedDataMap.set(this.data.columnHeader[index].key, value)
  
  },
  saveRecord: function(e){
    console.log(this.data.option)
    var that=this;
    var sql;
    if(this.data.option==1){
      sql="UPDATE "+ this.data.table+" SET "
      var index = 0;
      for (var item of editedDataMap) {
          sql += item[0];
          sql += "=" ;
          sql += "'";
          sql += item[1];
          sql += "'";
        if (index != editedDataMap.size-1){
          sql+=",";
        }
        index++
      }
      sql+=" WHERE "
      for (var i = 0; i < that.data.keyColumns.length;i++) {
          sql += that.data.keyColumns[i];
          sql += "=";
          sql += '"'+that.data.columnData[i].key+'"'
          if (i != that.data.keyColumns.length-1){
            sql += " AND "
          }
      }
        console.log(sql)
        that.setData({
          sql: sql,
        })
        that.queryDatabase();

    }else if(this.data.option==0){
        let args="{";
          var index = 0;
          for (var item of editedDataMap) {
            args += '"'+item[0]+'"';
            args += ":";
            args += '"'+item[1]+'"';
            if (index != editedDataMap.size - 1) {
              args += ",";
            }
            index++
          }
          args += "}";
          console.log(args)
          that.setData({
            args: args,
          })
          that.insertRecord();
    }
   
  },

  queryDatabase: function () {
    wx.showLoading({
      title: '正在保存',
    })
    var that = this
    wx.cloud.callFunction({
      name: 'queryDatabase',
      data: {
        host: that.data.host,
        port: that.data.port,
        user: that.data.user,
        password: that.data.password,
        database: that.data.database,
        type: 3,
        sql: that.data.sql
      }
    }).then(res => {
      wx.hideLoading()
      if (res.result == null) {
        wx.showToast({
          title: "保存失败，注意数据格式与数据约束",
          icon: 'none',
          duration: 2000
        })
      } else {
        wx.showToast({
          title: "保存成功",
          icon: 'success',
          duration: 1000
        })
      }
      console.log(res)

    })
  },

  insertRecord: function () {
    wx.showLoading({
      title: '正在保存',
    })
    var that = this
    wx.cloud.callFunction({
      name: 'insertRecord',
      data: {
        host: that.data.host,
        port: that.data.port,
        user: that.data.user,
        password: that.data.password,
        database: that.data.database,
        table: that.data.table,
        args: JSON.parse(that.data.args)
      }
    }).then(res => {
      wx.hideLoading()
      if(res.result==null){
        wx.showToast({
          title: "保存失败，注意数据格式与数据约束",
          icon: 'none',
          duration: 2000
        })
      }else{
        wx.showToast({
          title: "保存成功",
          icon: 'success',
          duration: 1000
        })
      }
      console.log(res)

    })
  },

})