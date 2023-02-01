// pages/aboutUs/aboutUs.js
import { post, API_ROOT } from '../../request/network'
Page({
  /**
   * 页面的初始数据
   */
  data: {
	API_ROOT,
    // 状态栏高度
    statusBarHeight: wx.getStorageSync("statusBarHeight") + "px",
    // 导航栏高度
    navigationBarHeight: wx.getStorageSync("navigationBarHeight") + "px",
    // 胶囊按钮高度
    menuButtonHeight: wx.getStorageSync("menuButtonHeight") + "px",
    // 导航栏和状态栏高度
    navigationBarAndStatusBarHeight:
      wx.getStorageSync("statusBarHeight") +
      wx.getStorageSync("navigationBarHeight") +
      "px",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},
  onClickBack() {
    wx.navigateBack({
      delta: 1,
    });
  },
});
