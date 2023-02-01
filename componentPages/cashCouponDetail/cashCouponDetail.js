import {
	getStoreNearby,
	getUserInfo
} from "../../request/getData";
import {
	myLogin,
	myMobile
} from "../../request/login";
import {
	post,
	API_ROOT
} from "../../request/network";
const app = getApp();
Page({
	leftArr: [],
	rightArr: [],
	pageNumber: '',
	userInfoData: {},
	clicktype: '',
	clickObj: '',
	//绑定手机号start
	sessionKeyValid: false,
	//绑定手机号end
	data: {
		API_ROOT,
		shareUser: '',
		isPhoneYes: true,
		isOngoing: true,
		showTop: true,
		timeStampM: 8655454,
		timeData: {},
		isTextChange: false,
		//渐入渐出动画效果
		userAnimation: {},
		// 24小时换算为86400000 毫秒
		// time: 1000 * 60 * 60 * 24, 
		time: 1000 * 60 * 60 * 25,
		daijinquanList: [],
		imgNumSwiper: 0,
		sellerInfo: {
			isCollect: 0
		},
		recommendInitTop: 0,
		navbarInitTop: 0,
		toView: "",
		// 遮罩层
		zzc_hidden: false,
		// 消费金弹窗
		xfjpopup: false,
		consumptionGold: "10",
		// 状态栏高度
		statusBarHeight: wx.getStorageSync("statusBarHeight") + "px",
		// 导航栏高度
		navigationBarHeight: wx.getStorageSync("navigationBarHeight") + "px",
		// 胶囊按钮高度
		menuButtonHeight: wx.getStorageSync("menuButtonHeight") + "px",
		// 导航栏和状态栏高度
		navigationBarAndStatusBarHeight: wx.getStorageSync("statusBarHeight") +
			wx.getStorageSync("navigationBarHeight"),
		currentPage: 0,
		middleGap: "20rpx",
		pageInfo: [],
		pageData: [],
		number: "0099",
		totalPage: 1, //总页数
		// 经纬度
		longitude: 0,
		latitude: 0,
		// 请求参数
		perCostStart: "", //人均消费-开始
		perCostEnd: "", //人均消费-结束
		storeType: "", //分类级别：FIRST, SECOND, THREE
		storeTypeN: "", //分类编号
		distance: "", //距离：纯数字，单位 m
		totalPage: 1,
		storePageSort: "DESC", //排序规则：ASC(升序), DESC（降序）
		storePageSortValue: "TIME", //排序属性：DISTANCE（距离） PRICE（金额）SALES（销量）
	},
	onChangeTime(e) {
		this.setData({
			timeData: e.detail,
		});
	},
	goQianggou(e) {
		if (!this.data.isOngoing || this.data.sellerInfo.remainingCount === 0) {
			//秒杀 已结束
			return
		}
		let obj = {
			...this.data.sellerInfo,
			...{
				bannerList: [this.data.sellerInfo.imageList[0].url],
				logo: this.data.sellerInfo.storeLogo
			}
		}
		let {
			vouchers
		} = e.currentTarget.dataset
		wx.navigateTo({
			url: `/componentPages/buyCashCoupon/buyCashCoupon?sellerInfo=${encodeURIComponent(JSON.stringify(obj))}&vouchersInfo=${encodeURIComponent(JSON.stringify(vouchers))}`
		});
	},
	onPageScroll(e) {
		this.setData({
			showTop: Number(e.scrollTop) >= 100 ? false : true
		})
	},
	goIndex() {
		wx.switchTab({
			url: '/pages/home/home'
		});
	},
	goHelp(e) {
		let {
			info
		} = e.currentTarget.dataset
		wx.navigateTo({
			url: `/componentPages/couponsInfo/helpCenter/helpCenter?info=${encodeURIComponent(JSON.stringify(info))}`
		});
	},
	collect(e) {
		const url = API_ROOT +
			`${this.data.sellerInfo.isCollect == 0 ? '/1/account/coupon/voucher/collect' : '/1/account/coupon/voucher/collect/del'}`;
		let param = {
			coupon_voucher_n: e.currentTarget.dataset.number //'CV251QDP20220615115833460'
		}
		post(url, param).then((res) => {
			setTimeout(()=>{
				wx.showToast({
					title: this.data.sellerInfo.isCollect == 0 ? "已取消收藏" : "收藏成功",
					icon: "none"
				});
			},1000)
			this.setData({
				'sellerInfo.isCollect': this.data.sellerInfo.isCollect == 0 ? 1 : 0
			});
		});
	},
	/**
	 * 用户点击分享
	 */
	onShareAppMessage: function() {
		console.log("this.data.sellerInfothis.data.sellerInfo",this.data.sellerInfo)
		return {
			title: this.data.sellerInfo.name,
			path: '/componentPages/cashCouponDetail/cashCouponDetail?number=' + this.pageNumber +
				'&shareUser=' + this.data.sellerInfo.userN,
		}
	},
	onShow() {
		// let token = wx.getStorageSync('access_token')
		// if (token){
		// 	this._getCouponInfo(this.pageNumber);
		// }
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		console.log('options', options)
		let number = options.number;
		this.pageNumber = number
		setInterval(() => {
			this.setData({
				isTextChange: !this.data.isTextChange
			})
		}, 10000)

		if (options.shareUser) {
			this.setData({
				shareUser: options.shareUser //分享人编号
			})
		}
		let token = wx.getStorageSync('access_token')
		if (!token) {
			//新用户登录  分享逻辑
			this.setData({
				isPhoneYes: false
			});
			wx.login({
				success: (res) => {
					// 微信获取登录的code信息只能使用一次
					let code = res.code;
					this.getLoginInfo(code, options);
				},
			});
		} else {
			//老用户
			this.getDataInfoApi(number)
		}
	},
	getDataInfoApi(number) {
		this._getCouponInfo(number);
		this.getVoucherList(number)
		this._getStoreNearby();
	},
	tapPhoneType(e) {
		this.clicktype = e.currentTarget.dataset.clicktype
		this.clickObj = e
		console.log("this.clickObj", this.clickObj)
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
					_this.getmobile("", iv, encryptedData);
				},
				fail() {
					// session_key
					wx.login({
						success(res) {
							_this.getmobile(res.code, iv, encryptedData);
						},
					});
				},
			});
		} else {
			wx.login({
				success(res) {
					_this.getmobile(res.code, iv, encryptedData);
				},
			});
		}
	},
	// 绑定手机号
	getmobile(code, iv, encryptedData) {
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
				if (_this.clicktype) {
					_this.goQianggou(_this.clickObj)
				}
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
	//登录
	getLoginInfo(code, options) {
		let _this = this;
		let param = {
			code: code
		};
		let accessToken = wx.getStorageSync("access_token");
		myLogin(param).then((res) => {
			wx.setStorageSync("access_token", res.access_token);
			_this.getInfo(options)
			_this.getDataInfoApi(_this.pageNumber)
		});
	},
	//获取用户信息
	getInfo(options) {
		getUserInfo().then(res => {
			this.userInfoData = res
			this.setData({
				isPhoneYes: res.mobile ? true : false
			})
			// this.createShare(this.data.shareUser, res.number, this.pageNumber) //分别是 分享者 - 被分享者 - 券编号
		})
	},
	// 创建分享记录
	createShare(shareUser, bySharer, number) {
		if(shareUser && bySharer){
			let param = {
				inviteN: shareUser, //分享人（邀请人）编号
				inviteeN: bySharer, //被分享人（被邀请人）编号
				cN: number, //券的编号
				type: '2' //分享类型，（2：代金券）
			}
			post(API_ROOT + '/1/coupon/share/createShare', param).then(res => {
			
			})
		}
	},
	onReachBottom() {
		this.addPageInfo();
	},
	//代金券列表内 item 任意一个  倒计时结束触发
	finish(e) {
		// 刷新代金券列表接口
		if(this.data.daijinquanList.length>0){
			let is = this.data.daijinquanList.every(item=>item.remainingTimeNum>=0)
			if(is){
				this.getVoucherList(this.pageNumber)
			}
		}
	},
	// 秒杀详情（距秒杀结束） 倒计时结束触发 
	finishMiao(e) {
		this.setData({
			isOngoing: false
		})
	},
	bindSwiperChange(e) {
		this.setData({
			imgNumSwiper: e.detail.current
		})
	},
	addPageInfo() {
		this._getStoreNearby();
	},
	_getStoreNearby() {
		if (this.data.currentPage >= this.data.totalPage) {
			return;
		}
		this.data.currentPage++;
		let param = {
			perCostStart: this.data.perCostStart,
			perCostEnd: this.data.perCostStart,
			storeType: this.data.storeType,
			storeTypeN: this.data.storeTypeN,
			distance: this.data.distance,
			currentPage: this.data.currentPage,
			longitude: this.data.longitude,
			latitude: this.data.latitude,
			storePageSort: this.data.storePageSort,
			storePageSortValue: this.data.storePageSortValue,
		};
		getStoreNearby(param).then((res) => {
			this.data.totalPage = res.page_count;
			let leftArr = this.leftArr,
				rightArr = this.rightArr,
				data = res.records;
			if (data.length != 0) {
				data.forEach((ele, i) => {
					ele.distance = (ele.distance / 1000).toFixed(1);
					if (i == 0 || i % 2 == 0) {
						leftArr.push(ele);
					} else {
						rightArr.push(ele);
					}
				});
			}
			this.setData({
				pageData: data,
				leftArr,
				rightArr,
			});
		});
	},
	onClickBack() {
		wx.navigateBack({
			delta: 1,
		});
	},
	onChange(event) {
		this.setData({
			active: event.detail,
		});
	},
	clickMobile(e) {
		wx.makePhoneCall({
			phoneNumber: e.currentTarget.dataset.mobile,
		}).catch((e) => {
			console.log(e);
		});
	},
	getVoucherList(number) {
		let param = {
			storeN: number
		}
		post(API_ROOT + '/1/coupon/voucherShowList', param).then(res => {
			let arr = res
			arr.forEach(item => {
				let current;
				if (item.remainingTimeNum === 0) {
					current = new Date(item.endTime.replace(/-/g, "/") + " 23:59:59")
					.getTime() - new Date()
						.getTime()
				} else {
					current = new Date(item.endTime.replace(/-/g, "/")).getTime() - new Date()
						.getTime()
				}
				item.timeStamp = current
			})
			this.setData({
				daijinquanList: arr
			})
		})
	},
	_getCouponInfo(number) {
		let param = {
			number: number
		};
		post(API_ROOT + "/1/coupon/couponInfo", param).then(res => {
			let sellerInfo = res;
			// 使用时间
			if (sellerInfo.useTimeLimit !== "[{}]") {
				sellerInfo.useTimeLimit = JSON.parse(sellerInfo.useTimeLimit)
				sellerInfo.useTimeLimit.forEach((item, index) => {
					item.useTime = item.useTime.join('-')
				})
			}
			// 不可用日期
			if (sellerInfo.unavailableDateLimit !== "[{}]") {
				sellerInfo.unavailableDateLimit = JSON.parse(sellerInfo.unavailableDateLimit)
				sellerInfo.unavailableDateLimit.forEach((item, index) => {
					item.unavailableTime = item.unavailableTime.join('至')
				})
			}
			// 不适用范围
			sellerInfo.unavailableLimit = JSON.parse(sellerInfo.unavailableLimit)
			// 使用规则
			sellerInfo.useRules = JSON.parse(sellerInfo.useRules)


			let timeStampM; //秒杀倒计时 时间戳计算
			if (res.remainingTimeNum === 0) {
				timeStampM = new Date(res.endTime.replace(/-/g, "/") + " 23:59:59").getTime() -
					new Date().getTime()
			} else {
				timeStampM = new Date(res.endTime.replace(/-/g, "/")).getTime() - new Date().getTime()
			}
			this.setData({
				sellerInfo,
				timeStampM
			});
			
			//分享逻辑
			if (this.data.shareUser) {
				console.log('获取详情后，创建分享记录调用接口');
				this.createShare(this.data.shareUser, res.userN, res.number) //分别是 分享者 - 被分享者 - 券编号
			}
		}).catch((err) => {
			wx.showToast({
				icon: "none",
				title: err.error_msg,
			});
			return false;
		});
	},
	test(data) {
		let number = data.detail.number;
		wx.navigateTo({
			url: "/componentPages/payEntrance/payEntrance?number=" + number,
		});
	},
	//腾讯地图
	openLocation(e) {
		wx.openLocation({
			latitude: +e.currentTarget.dataset.data.latitude || 39.90374,
			longitude: +e.currentTarget.dataset.data.longitude || 116.397827,
			name: e.currentTarget.dataset.data.name || "天安门广场", // 位置名
			address: e.currentTarget.dataset.data.address || "北京市东城区东长安街",
			scale: 18,
			infoUrl: e.currentTarget.dataset.data.url || "",
		});
	},
	goGold() {
		wx.switchTab({
			url: "/pages/gold/gold",
		}).catch((e) => {
			console.log(e);
		});
	},
	// 跳到顶部锚点
	goTop() {
		wx.createSelectorQuery().select('#allTop').boundingClientRect(function(rect) {
			/* 将页面移动到最顶部（用xxx的height定位） */
			wx.pageScrollTo({
				scrollTop: rect.top
			})
		}).exec()
	},
	toDetail(e) {
		let that = this;
		const query = wx.createSelectorQuery();
		query.select(".store_detail").boundingClientRect();
		query.selectViewport().scrollOffset();
		query.exec((rect) => {
			if (rect[0] && rect[1]) {
				wx.pageScrollTo({
					scrollTop: rect[0].top +
						rect[1].scrollTop -
						that.data.navigationBarAndStatusBarHeight,
					duration: 0,
				});
			}
		});
	},
	toRecommend() {
		let that = this;
		const query = wx.createSelectorQuery();
		query.select(".recommend").boundingClientRect();
		query.selectViewport().scrollOffset();
		query.exec((rect) => {
			if (rect[0] && rect[1]) {
				wx.pageScrollTo({
					scrollTop: rect[0].top +
						rect[1].scrollTop -
						that.data.navigationBarAndStatusBarHeight,
					duration: 0,
				});
			}
		});
	},
	//   closePopup() {
	//     this.setData({
	//       xfjpopup: false,
	//       zzc_hidden: true,
	//     });
	//   },
});
