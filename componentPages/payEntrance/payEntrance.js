import {
	getStoreNearby,
	getStoreInfo
} from "../../request/getData";
import {
	post,
	API_ROOT
} from "../../request/network";
const app = getApp();
Page({
	leftArr: [],
	rightArr: [],
	pageNumber: '',
	data: {
		API_ROOT,
		showTop: true,
		// 24小时换算为86400000 毫秒
		// time: 1000 * 60 * 60 * 24, 
		time: 1000 * 60 * 60 * 25,
		daijinquanList: [],
		imgNumSwiper: 0,
		sellerInfo: "",
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
	goInfo(e) {
		let number = e.currentTarget.dataset.number
		wx.navigateTo({
			url: '/componentPages/cashCouponDetail/cashCouponDetail?number=' + number //代金券优惠券详情页
		});
	},
	goQianggou(e) {
		console.log('e', e);
		// let obj;// = this.data.sellerInfo
		let {
			vouchers
		} = e.currentTarget.dataset
		let param = { number: vouchers.number }
		post(API_ROOT + '/1/coupon/couponInfo',param).then(res => {
			let sellerInfo = res;
			// 使用时间
			if(sellerInfo.useTimeLimit !== "[{}]"){
				sellerInfo.useTimeLimit = JSON.parse(sellerInfo.useTimeLimit)
				sellerInfo.useTimeLimit.forEach((item,index) => {
					item.useTime = item.useTime.join('-')
				})
			}
			// 不可用日期
			if(sellerInfo.unavailableDateLimit !== "[{}]"){
				sellerInfo.unavailableDateLimit = JSON.parse(sellerInfo.unavailableDateLimit)
				sellerInfo.unavailableDateLimit.forEach((item,index) => {
					item.unavailableTime = item.unavailableTime.join('至')
				})
			}
			// 不适用范围
			sellerInfo.unavailableLimit = JSON.parse(sellerInfo.unavailableLimit)
			// 使用规则
			sellerInfo.useRules = JSON.parse(sellerInfo.useRules)
			sellerInfo.bannerList = [sellerInfo.imageList[0].url]
			wx.navigateTo({
				url: `/componentPages/buyCashCoupon/buyCashCoupon?sellerInfo=${encodeURIComponent(JSON.stringify(sellerInfo))}&vouchersInfo=${encodeURIComponent(JSON.stringify(vouchers))}`
			});
		})
	},
	onPageScroll(e) {
		this.setData({
			showTop: Number(e.scrollTop) >= 800 ? false : true
		})
	},
	/**
	 * 用户点击分享
	 */
	// onShareAppMessage: function() {
	// 	return {
	// 		title: '详情',
	// 		// path: '/pages/travelSharing/travelSharing?id=' + res.data.result.dsrid,
	// 		path: '/componentPages/payEntrance/payEntrance',
	// 	}
	// },
	onShow(){
		this.getVoucherList(this.pageNumber)
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		// this.setData({
		//   consumptionGold: options.consumptionGold,
		//   xfjpopup: options.xfjpopup,
		//   zzc_hidden: !options.xfjpopup,
		// });
		let number = options.number;
		this.pageNumber = number
		this._getStoreInfo(number);
		this._getStoreNearby();
	},
	onReachBottom() {
		this.addPageInfo();
	},
	// 倒计时结束触发
	finish(e) {
		// 刷新代金券列表接口
		if(this.data.daijinquanList.length>0){
			let is = this.data.daijinquanList.every(item=>item.remainingTimeNum>=0)
			if(is){
				this.getVoucherList(this.pageNumber)
			}
		}
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
		let pages = getCurrentPages();
		// 如果是支付页面跳转，需要返回首页
		if (pages.length == 1) {
			wx.reLaunch({
				url: "/pages/home/home",
			});
		} else {
			wx.navigateBack({
				delta: pages.length + 1,
			});
		}
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
					// ios不支持 2020-03-06 的写法，所以兼容 改成 2020/03/06
					current = new Date(item.endTime.replace(/-/g, "/") + " 23:59:59").getTime() - new Date()
						.getTime()
					// current = 1000 * 2
				} else {
					current = new Date(item.endTime.replace(/-/g, "/")).getTime() - new Date().getTime()
				}
				item.timeStamp = current
			})
			this.setData({
				daijinquanList: arr
			})
		})
	},
	_getStoreInfo(number) {
		let param = {
			number: number,
		};
		getStoreInfo(param)
			.then((res) => {
				let sellerInfo = res;
				console.log(sellerInfo.businesStatus);
				this.setData({
					sellerInfo,
				});
			})
			.catch((err) => {
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
	clickPay(e) {
		wx.navigateTo({
			url: "/pages/pay/pay?store_n=" + e.currentTarget.dataset.number,
		}).catch((e) => {
			console.log(e);
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
