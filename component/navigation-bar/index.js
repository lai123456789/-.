// component/navigation-bar/index.js
import { post, API_ROOT } from '../../request/network'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    snfixed: Boolean,
  },

  /**
   * 组件的初始数据
   */
  data: {
	API_ROOT,
    // 状态栏高度
    statusBarHeight: wx.getStorageSync("statusBarHeight") + "px",
    // 导航栏高度
    navigationBarHeight: wx.getStorageSync("navigationBarHeight") + "px",
	// 胶囊按钮宽度
	menuButtonWidth: wx.getStorageSync("menuButtonWidth") + "px",
    // 胶囊按钮高度
    menuButtonHeight: wx.getStorageSync("menuButtonHeight") + "px",
    // 导航栏和状态栏高度
    navigationBarAndStatusBarHeight:
      wx.getStorageSync("statusBarHeight") +
      wx.getStorageSync("navigationBarHeight") +
      "px",
  },

  /**
   * 组件的方法列表
   */
  methods: {
    inputTap() {
      wx.navigateTo({
        url: "/componentPages/searchPage/searchPage",
      });
    },
  },
});
