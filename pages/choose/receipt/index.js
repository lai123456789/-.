// pages/menuConsoleInfo/index.js

const {
  get,
  API_ROOT
} = require("../../../request/network");

import {
  getStoreInfo
} from '../../../request/getData';

// 点餐小票详情
const menuConsoleInfoUrl = API_ROOT + "/1/menu/console/receipt";
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    storeInfo: {},
    color: app.globalData.color,
    menuConsoleN: '',
    orderClassify: '',
    menuConsoleInfo: {},
    foodArray: [],
    cartFoodArray: [],
    awaitConfirmedArray: [],
    beforeBtnShow: false,
    consumerBtnShow: false,
    consumerPayBtnShow: false,
    takeoutContinueBtnShow: false,
    takeoutAgainBtnShow: false,
    loading: true,
    receiptTitle: ''
  },

  _storeInfoFun: function () {
    var param = {
      number: app.globalData.store_n
    }
    getStoreInfo(param).then(data => {
      this.setData({
        storeInfo: data
      })
    })
  },

  // 继续点餐
  _clickContinue() {
    app.globalData.consoleType = this.data.menuConsoleInfo.type
    wx.navigateTo({
      url: '../food/index?menuConsoleN=' + this.data.menuConsoleN,
    })
  },

  // 再来一单
  _clickAgain() {
    app.globalData.consoleType = this.data.menuConsoleInfo.type
    wx.navigateTo({
      url: '../choices/food/index?mp_n=' + wx.getStorageSync("access_token"),
    })
  },

  // 点击付款
  _clickPay() {
    var menuConsoleN = this.data.menuConsoleN
    wx.navigateTo({
      url: '../prepaid/index?consoleN=' + menuConsoleN + "&orderType=CONSUMER"
    })
  },

  // 获取已点单菜品（审核通过）列表
  _menuConsoleInfo: function() {
    var that = this
    var param = {
      console_n: this.data.menuConsoleN
    }
    get(menuConsoleInfoUrl, param).then(data => {
      that.setData({
        menuConsoleInfo: data,
        loading: false
      })
      that._setReceiptTitle()
      that._setBtnShowIs()
    })
  },

  _setReceiptTitle: function () {
    let consoleType = this.data.menuConsoleInfo.type
    if (consoleType == 'CONSUMER' || consoleType == 'BEFORE') {
      this.setData({
        receiptTitle: this.data.menuConsoleInfo.table_n
      })
      return
    }
    let receiptTitle = ''
    let orderClassify = this.data.orderClassify
    if (orderClassify == 'TAKEOUT') {
      receiptTitle = '外卖'
    }
    if (orderClassify == 'PACK') {
      receiptTitle = '打包自取'
    }
    this.setData({
      receiptTitle: receiptTitle
    })
  },

  _setBtnShowIs: function () {
    let beforeBtnShow = false
    let consumerBtnShow = false
    let consumerPayBtnShow = false
    let takeoutContinueBtnShow = false
    let takeoutAgainBtnShow = false
    var status = this.data.menuConsoleInfo.status
    if (status == 'RUNNING') {
      if (this.data.orderClassify == 'TAKEOUT' || this.data.orderClassify == 'PACK') {
        takeoutContinueBtnShow = true
      }
      if (this.data.orderClassify == 'CONSUMER') {
        consumerBtnShow = true
      }
      if (this.data.orderClassify == 'BEFORE') {
        beforeBtnShow = true
      }
    } else if(status == 'SETTLE_ING') {
      if (this.data.orderClassify == 'CONSUMER') {
        consumerPayBtnShow = true
      }
    } else {
      if (this.data.orderClassify == 'TAKEOUT' || this.data.orderClassify == 'PACK') {
        takeoutAgainBtnShow = true
      }
    }
    this.setData({
      beforeBtnShow: beforeBtnShow,
      consumerBtnShow: consumerBtnShow,
      consumerPayBtnShow: consumerPayBtnShow,
      takeoutContinueBtnShow: takeoutContinueBtnShow,
      takeoutAgainBtnShow: takeoutAgainBtnShow
    })
  },

  // 联系
  _makePhoneCall: function (e) {
    var mobile = e.currentTarget.dataset.mobile;
    if (!mobile) {
      wx.showToast({
        title: '手机号码异常',
        icon: 'none'
      })
      return
    }
    wx.makePhoneCall({
      phoneNumber: mobile
    })
  },

  _clickStoreAddress(e) {
    var item = this.data.menuConsoleInfo
    wx.openLocation({
      latitude: parseFloat(item.mate_data.latitude),
      longitude: parseFloat(item.mate_data.longitude),
      address: item.mate_data.store_address,
      name: item.mate_data.store_address
    })
  },

  _clickUserAddress(e) {
    var item = this.data.menuConsoleInfo
    wx.openLocation({
      latitude: parseFloat(item.mate_data.latitude),
      longitude: parseFloat(item.mate_data.longitude),
      address: item.mate_data.user_address,
      name: item.mate_data.user_address
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      menuConsoleN: options.menuConsoleN,
      orderClassify: options.orderClassify,
    })
    console.log("===========receipt==========");
    console.log(options.orderClassify);
    this._storeInfoFun()
    this._menuConsoleInfo()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this._menuConsoleInfo()
    setTimeout(() => {
      wx.stopPullDownRefresh(); //停止下拉元点
    }, 1000);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})