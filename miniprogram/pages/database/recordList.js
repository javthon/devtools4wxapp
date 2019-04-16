String.prototype.replaceAll = function (FindText, RepText) {
  return this.replace(new RegExp(FindText, "g"), RepText);
}
var app = getApp();
const keywordTips1=["SELECT, INSERT INTO, UPDATE, DELETE FROM"];
const keywordTips2 = ["FROM, WHERE, ORDER BY, ASC, DESC, AS, DISTINCT, AND, OR, GROUP BY, LEFT JOIN, RIGHT JOIN"];

const selectPrimaryKeySqlPrefix ="SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA=";
Page({

  data: {

    database: "",
    type:3,
    table:'',
    sql:"",
    keyColumns:[],
    resultArray:[],
    noRecord:false,
    isDelete:false,
    inputVisible:false,
    sqlName:"",
    hasChosenSql:false
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    var savedSql=undefined;
    if (options.savedSql!=undefined){
      console.log(options.savedSql)
      savedSql = options.savedSql.replaceAll("@", "=");
    }
    console.log(options)
    var that = this;
    that.setData({
      database: options.database,
      table: options.table
    })
    wx.getStorage({
      key: 'connection',
      success: function (res) {
        that.setData({
          host: res.data[0],
          port: res.data[1],
          user: res.data[2],
          password: res.data[3],
          database: options.database,
          table: options.table,
          sql: "SELECT * FROM " + options.table + " LIMIT 50"
          // database: 'test',
          // table: 'test',
          // sql: "SELECT * FROM " + "test" + " LIMIT 5"
        })
        that.queryDatabase();
      },
      fail: function () {
        wx.navigateTo({
          url: './login'
        })
      }
    });


    wx.getStorage({
      key: 'hasShownRecordTip',
      success: function (res) {
        if(res.data=='false'){
          wx.showModal({
            content: '长按某一条记录可以对其进行增删改的操作，本工具不校验数据格式的正确性',
            confirmText: "不再提示",
            cancelText: "我知道了",
            success: function (res) {
              if (res.confirm == true) {
                wx.setStorage({
                  key: "hasShownRecordTip",
                  data: "true"
                })
              } else {
                wx.setStorage({
                  key: "hasShownRecordTip",
                  data: "false"
                })
              }
            },

          });
        }
      },
      fail: function () {
        wx.showModal({
          content: '长按某一条记录可以对其进行增删改的操作，本工具不校验数据格式的正确性',
          confirmText: "不再提示",
          cancelText: "我知道了",
          success: function (res) {
            if(res.confirm==true){
              wx.setStorage({
                key: "hasShownRecordTip",
                data: "true"
              })
            }else{
              wx.setStorage({
                key: "hasShownRecordTip",
                data: "false"
              })
            }
          },
         
        });
      }
    });


    if (savedSql != undefined) {
      wx.showLoading({
        title: '请稍等',
      })
      setTimeout(() => { //表
        that.setData({
          sql: savedSql
        })
      }, 2000)
      wx.hideLoading();
     
    }
  },

  showInput: function(){
    this.setData({
      inputVisible:true
    })
  },
  cancelSave:function(){
    this.setData({
      inputVisible: false,
      sqlName:""
    })
  },
  loadSql:function(){
    wx.navigateTo({
      url: './savedSqlList?database='+this.data.database+"&table="+this.data.table
    })
  },
  saveSql: function () {
    if (this.data.sqlName==""){
      wx.showToast({
        title: 'sql名字不能为空哦',
        icon: 'none',
        duration: 2000
      })
      return false
    }
    var that=this
    wx.getStorage({
      key: 'savedSqls',
      success: function (res) {
        var savedSqls=res.data;
        var content = { name: that.data.sqlName, value: that.data.sql }
        savedSqls.push(content);
        wx.setStorage({
          key: "savedSqls",
          data: savedSqls
        })
        that.setData({
          inputVisible:false,
          sqlName:''
        })
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 2000
        })
      },
      fail: function () {
        var sql = [];
        var content = { name: that.data.sqlName,value:that.data.sql}
        sql.push(content);
        wx.setStorage({
          key: "savedSqls",
          data: sql
        })
        that.setData({
          inputVisible: false,
          sqlName: ''
        })
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 2000
        })
      }
    });
  },
  refresh:function(){
    this.queryDatabase();
  },
  inputSql: function (e) {
    this.setData({
      sql: e.detail.value
    })
  },

  inputSqlName: function (e) {
    this.setData({
      sqlName: e.detail.value
    })
  },
  
  queryDatabase: function(){
    wx.showLoading({
      title: '正在运行',
    })
    var that=this
    wx.cloud.callFunction({
      name: 'queryDatabase',
      data: {
        host: that.data.host,
        port: that.data.port,
        user: that.data.user,
        password: that.data.password,
        database: that.data.database,
        type:3,
        sql:that.data.sql
      }
    }).then(res=>{
      
      console.log(res.result)
      if(res.result==null){
        wx.hideLoading()
        wx.showToast({
          title: '查询失败，请重试',
          icon: 'none',
          duration: 2000
        })
      }else if(res.result.length==0){
        this.setData({
          noRecord: true,
        })
        wx.hideLoading()
      }else{

      if(!that.data.isDelete){

     
      let dataExample=res.result[0];
      let columnHeader=[];
      for (var key in dataExample) {
        columnHeader.push(key);
      }
      this.setData({
        resultArray : res.result,
        columnHeader: columnHeader,
        noRecord:false
      })

      //得到表的主键
      let selectKeyColumnSql = selectPrimaryKeySqlPrefix + "'"+that.data.database+"'" + " AND TABLE_NAME=" + "'"+that.data.table+"'"
      console.log(selectKeyColumnSql)
      wx.cloud.callFunction({
        name: 'queryDatabase',
        data: {
          host: that.data.host,
          port: that.data.port,
          user: that.data.user,
          password: that.data.password,
          database: that.data.database,
          type: 3,
          sql: selectKeyColumnSql
        }
      }).then(res => {
        that.setData({
          keyColumns: [],
        })
        for (var i = 0; i < res.result.length;i++){
          that.data.keyColumns.push(res.result[i].COLUMN_NAME)
        }
       
      })
      wx.hideLoading()
      }
      }

      if (that.data.sql.toLowerCase().indexOf("select") == -1) {
        that.setData({
          sql: "SELECT * FROM " + that.data.table + " LIMIT 50",
          isDelete: false
        })
        that.queryDatabase();
      }
    })
    
    
  },

  showOperation: function(e){
    var that=this;
    var sqlTemp = that.data.sql.replace(/ /g, "")
 console.log(sqlTemp)
    if (sqlTemp.toLowerCase().indexOf("select*")==-1){
      wx.showModal({
        content: '使用SELECT * 查询所有属性后才可对数据进行增删改的操作',
        confirmText: "确认",
        cancelText: "取消",
        
      });
      return false;
    }

    var dataset = e.currentTarget.dataset;
    var record = JSON.stringify(dataset.record)
    var keyColumns = JSON.stringify(that.data.keyColumns)
    wx.showActionSheet({
      itemList: ['新增记录', '修改记录', '删除记录'],
      success: function (res) {
        var needChance = res.tapIndex
        if(needChance==2){
          wx.showModal({
            content: '确认删除选中记录？',
            confirmText: "确认",
            cancelText: "取消",
            success: function (res) {
              
              if(res.confirm==true){
                var sql="DELETE FROM ";
                sql+=that.data.table;
                sql+=" WHERE ";
                var keyColumnsTemp = that.data.keyColumns;
                for (var i = 0; i < keyColumnsTemp.length; i++) {
                  sql += keyColumnsTemp[i];
                  sql += "=";
                  sql += '"' + dataset.record[keyColumnsTemp[i]] + '"'
                  if (i != keyColumnsTemp.length - 1) {
                    sql += " AND "
                  }
                }
                console.log(sql)
                that.setData({
                  sql: sql,
                  isDelete:true
                })
                that.queryDatabase();
                setTimeout(() => { //表
                  that.setData({
                    sql: "SELECT * FROM " + that.data.table + " LIMIT 50",
                    isDelete: false
                  })

                  that.queryDatabase();
                }, 1000)
               
              }
              console.log(keyColumnsTemp+"-keys");
            }
          });
        }else{
          wx.navigateTo({
            url: './singleData?record=' + record.replaceAll("=", "@").replaceAll("&","%*%") + "&option=" + res.tapIndex + "&keyColumns=" + keyColumns + "&table=" + that.data.table + "&database=" + that.data.database,
          })
        }
        
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
  }


})