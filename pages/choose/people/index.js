// pages/appointment/people/index.js

import {
  menuConsoleExist
} from '../../../utils/menuConsole';
import {
  getStoreSetting
} from '../../../utils/setting';
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mineHeight: 0,
    seatsN: '',
    peopleCount: 1,
    consumerCount: 0,
  },

  _storeSetting: function () {
    var that = this
    getStoreSetting().then(data => {
      app.globalData.consoleType = data.consumeSettingMO.consumer_type
      that.setData({
        consumerCount: data.consumeSettingMO.consumer_count,
      })
    })
  },

  _menuConsoleExist() {
    var that = this
    menuConsoleExist(this.data.seatsN).then(data => {
      // 控制台存在且控制台类型是先消费，则跳转至小票页
      if (data.menu_console_n && data.type == 'CONSUMER') {
        wx.reLaunch({
          url: '../receipt/index?menuConsoleN=' + data.menu_console_n + "&orderClassify=CONSUMER",
        })
        app.globalData.consoleType = data.type
        return
      }
      // 控制台存在且控制台类型是先付款，则跳转至点餐台
      if (data.menu_console_n && data.type == 'BEFORE') {
        wx.reLaunch({
          url: '../food/index?mp_n=' + that.data.seatsN + '&consumerCount=' + data.repast_count,
        })
        app.globalData.consoleType = data.type
        return
      }
      // 选择就餐人数
      that._storeSetting()
    })
  },

  _toDetail(e) {
    let consumerCount = (e.currentTarget.dataset.index * 1)
    wx.redirectTo({
      url: '../food/index?mp_n=' + this.data.seatsN + '&consumerCount=' + consumerCount,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const {
      windowWidth,
      windowHeight
    } = wx.getSystemInfoSync()
    let mineHeight = (windowHeight * (750 / windowWidth))
    if (!options.seatsN) {
      wx.showToast({
        title: '桌台异常，请联系管理员',
        icon: 'none'
      })
      return
    }
    this.setData({
      mineHeight :mineHeight,
      seatsN: options.seatsN
    })
    this._menuConsoleExist()
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