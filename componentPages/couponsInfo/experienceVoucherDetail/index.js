import { post, API_ROOT } from '../../../request/network'
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		info: [],
		API_ROOT,
	},
	goUse() {
		wx.switchTab({
			url: "/pages/coupon/coupon"
		})
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		console.log('options',options);
		// info 数组类型
		this.setData({
			info: JSON.parse(decodeURIComponent(options.info))
		})
		console.log(this.data.info);
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function() {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function() {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function() {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function() {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function() {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function() {

	}
})
