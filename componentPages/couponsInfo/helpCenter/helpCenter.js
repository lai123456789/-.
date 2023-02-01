import { post, API_ROOT } from '../../../request/network'
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		API_ROOT,
		sellerInfo: {},
		titleList: [{
				title: "我要申请退款"
			},
			{
				title: "代金券如何使用"
			},
			{
				title: "如何查询商家电话"
			},
			{
				title: "代金券是否可以延期"
			},
			{
				title: "代金券可用日期及可用时间"
			}
		]
	},
	goUse(){
		wx.navigateTo({
			url: '/componentPages/couponsInfo/verificationCodeDetails/verificationCodeDetails'
		});
	},
	clickItem(e) {
		console.log(e)
		let data = e.currentTarget.dataset.data
		let index = e.currentTarget.dataset.index
		switch (index) {
			case 0:
				wx.showModal({
					title: "您好，可以点击下面选项进行操作（注：订单退款成功后不可撤回，支付金额将在1-3个工作日内退款到原支付方））",
					cancelText: '确定退款',
					confirmText: '返回帮助',
					success(res) {
						if (res.confirm) {} else {
							wx.showToast({
								icon: "none",
								title: '确定退款',
							});
						}
					},
				});
				break;
			case 1:
				wx.showModal({
					title: "您好，代金券凭消费密码去商家消费即可。点击会话下面的（查询代金券）按钮，找到要消费的代金券，点击进入代金券详情，把代金券二维码出示给商家，让商家进行验证，就可以消费了",
					showCancel: false,
					confirmText: '查看详情',
					success(res) {
						if (res.confirm) {
							wx.navigateTo({
								url: '/componentPages/couponsInfo/verificationCodeDetails/verificationCodeDetails'
							});
						}
					},
				});
				break;
			case 2:
				wx.showModal({
					title: "您好，点击下方联系商家按钮即可；",
					showCancel: false,
					confirmText: '联系商家',
					success(res) {
						if (res.confirm) {
							wx.makePhoneCall({
								phoneNumber: data.mobile,
							}).catch((e) => {
								console.log(e);
							});
						}
					},
				});
				break;
			case 3:
				wx.showModal({
					title: "您好，代金券有效期是商家合作项目设置的期限，美点汇平台不可能单方面延长有效期。如果商家对有效期做了延长，您是可以继续使用的，如果商家未操作延期，在过期后为您自动退款，退款后1-3个工作日退回到您的原支付账户。",
					showCancel: false,
					confirmText: '知道了'
				});
				break;
			case 4:
				wx.showModal({
					title: "您好，代金券可用时间11:00-16:00，18:00-23:00时段可用，具体以各地区门店实际经营情况为准。",
					showCancel: false,
					confirmText: '知道了'
				});
				break;
		}
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.setData({
			sellerInfo: JSON.parse(decodeURIComponent(options.info))
		})
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
