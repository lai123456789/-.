// pages/contactUs/contactUs.js
import { post, API_ROOT } from '../../request/network'
Page({
    /**
     * 页面的初始数据
     */
    data: {
		API_ROOT,
	},
  
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {},
    // handleContact (e) {
    //     console.log(e.detail.path)
    //     console.log(e.detail.query)
    // },
    lxdh() {
      wx.makePhoneCall({
        phoneNumber: "0755-83290906",
      }).catch((e) => {
        console.log(e);
      });
    },
  });
  