import {
	cardVoucherList
} from "../../../request/getData";
import { post, API_ROOT } from '../../../request/network'
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		API_ROOT,
		active: 1,
		tabTitle: ['未使用', '已使用', '已失效'],
		voucherList: [],
	},
	onChange(event) {
		this.setData({
			active: event.detail.name
		})
		this.getList(event.detail.name)
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function() {
		
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
		this.getList(1);
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
		this.getList(this.data.active)
		wx.stopPullDownRefresh();
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

	},
	// 点击去使用
	// couponType 卡券类型 1-体验券，2-代金券
	goUse(e) {
		let data = e.currentTarget.dataset
		if(data.coupontype === 2){
		// 如果为 代金券 跳到核销码核销详情页面
			wx.navigateTo({
				url: `/componentPages/couponsInfo/verificationCodeDetails/verificationCodeDetails?sn=${data.sn}&number=${data.number}`
			})
		}else{
			console.log("跳体验券体验券页面")
			// 如果为 体验券 跳到 tabbar优惠券页面即可
			wx.switchTab({
				url: "/pages/coupon/coupon"
			})
		}
	},
	// 跳转对应详情页
	goInfo(e){
		if(this.data.active > 1){
			return
		}
		let data = e.currentTarget.dataset
		console.log('datadata', data);
		let info = data.info
		if(data.coupontype === 2){
			// 如果为 代金券 跳到 核销详情页
			wx.navigateTo({
				// url: `/componentPages/couponsInfo/verificationCodeDetails/verificationCodeDetails?sn=${info.sn}` 
				url: `/componentPages/cashCouponDetail/cashCouponDetail?number=${info.number}`
			});
		}else{
			// 如果为 体验券  跳到体验券详情页
			let infoArr = [info]
			wx.navigateTo({
				url: `/componentPages/couponsInfo/experienceVoucherDetail/index?info=${encodeURIComponent(JSON.stringify(infoArr))}`
			});
		}
	},
	getList(statusNum) {
		let obj = {
			status: statusNum
		}
		cardVoucherList(obj).then(res => {
			this.setData({
				voucherList: res
			});
		})
		// let voucherList = [{
		// 	amount: 5, //优惠券金额
		// 	channelType: 1, //活动交易类型（1、通用，2、线上购买代金券，3、线下门店支付）
		// 	couponType: 1, //卡券类型（1、体验券，2、代金券）
		// 	name: '体验券券名称', //优惠券名称
		// 	remainingDate: '2022-05-01至2022-05-31', //剩余时间，日期类型  date-time
		// 	remainingTimeNum: 1, //剩余时间，天数
		// 	status: 1, //卡券状态 1：未使用，2：已使用，3：已失效
		// 	useLimitNum: 2,// 每个订单最多使用多少张，可用数量，核销限制数量
		// 	buyAmount: 3,//付款金额
		// 	minAmount: 50, //满多少可用
		// 	storeN: 'SN1654738957692'
		// }, {
		// 	amount: 39,
		// 	channelType: 1,
		// 	couponType: 2,
		// 	name: '代金券名称',
		// 	remainingDate: '2022-05-01至2022-05-31',
		// 	remainingTimeNum: 4,
		// 	status: 1,
		// 	useLimitNum: 2,
		// 	buyAmount: 3,
		// 	minAmount: 50,
		// 	storeN: 'SN1654738957692'
		// }, {
		// 	amount: 11,
		// 	channelType: 1,
		// 	couponType: 1,
		// 	name: '测试体验券名称',
		// 	remainingDate: '2022-05-01 06:03:09',
		// 	remainingTimeNum: 3,
		// 	status: 1,
		// 	useLimitNum: 2,
		// 	buyAmount: 3,
		// 	minAmount: 50,
		// 	storeN: 'SN1654738957692'
		// }]
		// this.setData({
		// 	voucherList: voucherList
		// });
	},
})
