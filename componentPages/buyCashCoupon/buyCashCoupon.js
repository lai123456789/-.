import {
	post,
	API_ROOT
} from '../../request/network'
import {
	getUserInfo
} from "../../request/getData";
import {
	myLogin,
	myMobile
} from "../../request/login";
import {
	_debounce
} from "../../utils/util";
const app = getApp();
Page({
	/**
	 * 页面的初始数据
	 */
	couponsListAll: [],
	discount_array: [],
	sessionKeyValid: false,
	data: {
		API_ROOT,
		selectIndex: 0,
		isPhoneYes: false,
		selectCoupon: {},
		availableCoupons: [], //可用优惠券列表
		unavailableCoupons: [], //不可用优惠券列表
		currency: '',
		dataInfo: {},
		vouchersInfo: {},
		prepareOrderInfo: {},
		practical_amount: '',
		consumer_amount: '',
		ought_amount: '',
		result: [],
		radio: 0,
		// 是否可叠加使用 单选或多选
		isSuperposition: false,
		couponsList: [],
		num: 1,
		active: 2,
		checked: false,
		show: false,
		activeSelect: 1,
		Tabs: [],
		attribute: {
			width: '112rpx',
			borderColor: '#F93A4A'
		},
		cooponIndex: ''
	},
	onChangeRadio(e) {
		if (this.data.selectIndex == 0) {
			let {
				index
			} = e.currentTarget.dataset
			this.setData({
				radio: index == this.data.cooponIndex ? -1 : index,
				cooponIndex: index == this.data.cooponIndex ? -1 : index
			});
		}
	},
	onChangeCheckbox(event) {
		console.log('event', event);
		this.setData({
			result: event.detail,
		});
	},
	handleTabsChange(e) {
		const {
			index
		} = e.detail;
		const {
			Tabs
		} = this.data;
		Tabs.forEach((v, i) =>
			i === index ? (v.isActive = true) : (v.isActive = false)
		);
		let list = []
		if (index == 0) {
			// 可用优惠券
			list = this.couponsListAll.filter(item => item.type === 1)
			list.forEach(item => item.isUse = true)
		} else {
			// 不可用优惠券
			list = this.couponsListAll.filter(item => item.type === 0)
			list.forEach(item => item.isUse = false)
		}
		console.log(list);
		// this.couponsList = []
		// this.getUseCouponsList(index)
		this.setData({
			Tabs,
			couponsList: list,
			selectIndex: index
		});
	},
	onClose() {
		// this.setData({
		// 	show: false,
		// });
		if(this.data.selectIndex == 0){
			this.goSure()
		}else{
			this.setData({
				show: false,
			});
		}
	},
	onSelect(event) {
		console.log(event.detail);
	},
	selectCard() {
		this.setData({
			show: true
		});
	},
	goBuy() {
		if (!this.data.checked) {
			wx.showToast({
				icon: "none",
				title: '请先勾选阅读协议！'
			})
			return
		}
		let param = {
			count: this.data.num || 1,
			voucher_coupon_id: this.data.vouchersInfo.id,
			discount_array: JSON.stringify(this.discount_array)
		}
		post(API_ROOT + '/1/coupon/order/create', param).then(res => {
			if(res.amount > 0){
				this.getTradeInfo(res.order_n) //直接发起支付交易
			}else{
				// 无需发起支付 直接成功
				wx.showToast({
					title: "支付成功",
					icon: "none",
					duration: 1500,
				});
				setTimeout(() => {
					wx.redirectTo({
						url: "/componentPages/couponsInfo/cardVoucher/index"
					});
				}, 1500);
			}
		})
	},
	getTradeInfo(orderNumber) {
		let param = {
			order_n: orderNumber
		}
		post(API_ROOT + '/1/trade/info', param).then(res => {
			this.paymoment(res)
			//支付成功跳转代金券核销详情列表页
		})
	},
	paymoment(datas) {
		const {
			timeStamp,
			nonceStr,
			package_,
			signType,
			paySign
		} = {
			...datas,
		};
		wx.requestPayment({
			timeStamp: timeStamp,
			nonceStr: nonceStr,
			package: package_,
			signType: signType,
			paySign: paySign,
			success: (res) => {
				wx.showToast({
					title: "支付成功",
					icon: "none",
					duration: 1500,
				});
				setTimeout(() => {
					wx.redirectTo({
						url: "/componentPages/couponsInfo/cardVoucher/index"
					});
				}, 1500);
			},
			fail: (res) => {
				wx.showToast({
					title: "支付失败,请重新付款",
					icon: "none",
					duration: 1500,
				});
				// setTimeout(() => {
				// 	// 失败返回上一页面重新发起付款
				// 	wx.navigateBack({
				// 		delta: 1
				// 	})
				// }, 2000)
			},
		});
	},
	onChange(event) {
		this.setData({
			checked: event.detail,
		});
	},
	goRules() {
		wx.navigateTo({
			url: "/componentPages/rules/rules",
		});
	},
	// 是否使用消费金
	usePreferential(e) {
		const {
			index
		} = e.currentTarget.dataset;
		this.setData({
			active: index,
		});
		if (index == 2) {
			//使用消费金  是
			this.discount_array.push({
				discountType: "CONSUMER_AMOUNT",
			});
			// this._prepaidOrder();
		} else {
			// 否
			this.discount_array = this.discount_array.filter((item, index) => {
				return item.discountType != 'CONSUMER_AMOUNT'
			})
			// this._prepaidOrder();
		}
		this.prepareOrder()
	},
	jian() {
		this.minput(null, this.data.num - 1)
	},
	add() {
		this.minput(null, this.data.num + 1)
	},
	minput(e, value) {
		let num = e && e.detail ? Number(e.detail.value) : Number(value)
		this.setData({
			num: 1
		})
		// this.prepareOrder(num)
		// if (num <= 999) {
		// 	if (num <= 0) {
		// 		// this.setData({
		// 		// 	num: 1
		// 		// })
		// 	} else {
		// 		this.setData({
		// 			num: num,
		// 		})
		// 	}
		// } else {
		// 	wx.showToast({
		// 		title: '最多只能输入999',
		// 		icon: 'none',
		// 	})
		// 	this.setData({
		// 		num: 999,
		// 	})
		// }
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		wx.login({
			success: (res) => {
				// 微信获取登录的code信息只能使用一次
				let code = res.code;
				this.getLoginInfo(code);
			},
		});
		//
		let obj = JSON.parse(decodeURIComponent(options.sellerInfo));
		console.log('sellerInfosellerInfo',obj)
		let vouchers = JSON.parse(decodeURIComponent(options.vouchersInfo));
		console.log('vouchersInfo',vouchers)
		this.setData({
			dataInfo: obj,
			vouchersInfo: vouchers
		})
	},
	getphonenumber(e) {
		wx.showToast({
		  title: '请先授权绑定手机号',
		  icon: 'none'
		})
		if (!e.detail.iv) {
			wx.showToast({
				icon: "none",
				title: "绑定手机失败,请重试",
				duration: 1500,
			});
			return;
		}
		let _this = this;
		let iv = e.detail.iv;
		let encryptedData = e.detail.encryptedData;
		if (this.sessionKeyValid) {
			wx.checkSession({
				success() {
					// session_key 未过期
					_this.getmobile("",iv,encryptedData);
				},
				fail() {
					// session_key
					wx.login({
						success(res) {
							_this.getmobile(res.code,iv,encryptedData);
						},
					});
				},
			});
		} else {
			wx.login({
				success(res) {
					_this.getmobile(res.code,iv,encryptedData);
				},
			});
		}
	},
	// 绑定手机号
	getmobile(code,iv,encryptedData) {
		let _this = this;
		let param = {
			iv: iv,
			encrypted_data: encryptedData,
			code: code,
		};
		myMobile(param)
			.then((res) => {
				wx.setStorageSync("access_token", res.access_token);
				_this.setData({
					sessionKeyValid: true,
					isPhoneYes: true
				});
				_this.goBuy()
			})
			.catch((err) => {
				wx.showToast({
					title: err.error_msg,
					icon: "none",
				});
				_this.setData({
					sessionKeyValid: true,
					isPhoneYes: false
				});
			});
	},
	
	//获取登录信息
	getLoginInfo(code) {
		let param = {
			code: code,
			// store_n: app.globalData.store_n,
		};
		myLogin(param).then((res) => {
			wx.setStorageSync("access_token", res.access_token);
			// this.getLocationSetting();
			this._getUserInfo();
			this.getUseCouponsList(1)
		});
	},
	_getUserInfo() {
		getUserInfo().then((e) => {
			this.setData({
				// nick_name: e.user.nick_name,
				currency: e.currency,
				isPhoneYes: e.mobile ? true : false
			});
		});
	},
	prepareOrder(num) {
		// let discountArray = [{
		// 	discountType: 'EXPERIENCE',
		// 	coupon_id: '11' //体验券id
		// },{
		// 	discountType: 'CONSUMER_AMOUNT',
		// 	coupon_id: '11' //消费金 id可不传
		// }]
		console.log('this.data.vouchersInfothis.data.vouchersInfo', this.data.vouchersInfo);
		let param = {
			count: num || 1,
			voucher_coupon_id: this.data.vouchersInfo.id,
			discount_array: JSON.stringify(this.discount_array)
		}
		post(API_ROOT + '/1/coupon/order/prepaid', param).then(res => {
			let practical_amount = (res.amount.practical_amount * 1).toFixed(2),
				consumer_amount = (res.consumer_amount * 1).toFixed(2),
				ought_amount = (res.amount.ought_amount * 1).toFixed(2);
			this.setData({
				prepareOrderInfo: res,
				practical_amount,
				ought_amount,
				consumer_amount
			})
		})
	},
	getUseCouponsList(index) {
		// let param = { type: index }
		let param = {}
		post(API_ROOT + '/1/coupon/experience/userSelectExperienceList', param).then(res => {
			this.couponsListAll = res
			//item.type  0 不可用  1 可用
			let filterArr = res.filter(item => item.type === 1)
			console.log('filterArrfilterArr', filterArr)
			filterArr.forEach(item => item.isUse = true)
			let unfilterArr = res.filter(item => item.type === 0)
			let keyongLength = filterArr.length //可用数量
			let bukeyongLength = res.length - keyongLength //不可用数量
			this.setData({
				selectCoupon: filterArr[0],
				couponsList: filterArr,
				Tabs: [{
					id: 0,
					name: `可用优惠劵（${keyongLength}）`,
					isActive: true,
				}, {
					id: 1,
					name: `不可用优惠劵（${bukeyongLength}）`,
					isActive: false
				}],
				availableCoupons: filterArr,
				unavailableCoupons: unfilterArr,
			})
			let arr = [{
				discountType: "CONSUMER_AMOUNT", //是否使用消费金 默认是 填充该对象
			}]
			if (filterArr.length > 0) {
				arr.push({
					discountType: 'EXPERIENCE',
					coupon_id: filterArr[0].id //体验券id
				})
			}
			this.discount_array = arr
			this.prepareOrder()
		})
	},
	goSure() {
		let index = this.data.radio
		this.discount_array = this.discount_array.filter(item => item.discountType !== 'EXPERIENCE')
		this.setData({
			show: false
		})
		if(index == -1){
			this.prepareOrder()
			return  //不选择优惠券 return中断后面操作
		}
		this.setData({
			selectCoupon: this.data.couponsList[index],
		})
		let obj = {
			discountType: 'EXPERIENCE',
			coupon_id: this.data.couponsList[index].id //体验券id
		}
		this.discount_array.push(obj)
		this.prepareOrder()
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
