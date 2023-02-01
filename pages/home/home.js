import {
	request
} from "../../request/request";
import {
	post,
	API_ROOT
} from "../../request/network";
import {
	myLogin,
	myMobile
} from "../../request/login";
import {
	_debounce
} from "../../utils/util";
import {
	getStoreNearby,
	getCatesList,
	getUserInfo,
	experienceVoucherList,
	toGetExperienceVoucher
} from "../../request/getData";
const app = getApp();
Page({
	/**
	 * 页面的初始数据
	 */
	leftArr: [],
	rightArr: [],
	// 请求参数
	couponType: "", //优惠活动
	perCostStart: "", //人均消费-开始
	perCostEnd: "", //人均消费-结束
	storeType: "", //分类级别：FIRST, SECOND, THREE
	storeTypeN: "", //分类编号
	distance: "", //距离：纯数字，单位 m
	currentPage: 0,
	storePageSort: "DESC", //排序规则：ASC(升序), DESC（降序）
	storePageSortValue: "TIME", //排序属性：DISTANCE（距离） PRICE（金额）SALES（销量）
	foodList: "",
	foodItem: "",
	// 筛选框触发
	handNavbar: false,
	// 是否授权完成
	authLocation: false,
	mobile: "",
	encryptedData: "",
	sessionKeyValid: false,
	data: {
		API_ROOT,
		// banner图列表
		bannerList: [
			API_ROOT + "/1/accessory/redirect?accessory_no=XL20220617085831GWIZ",
			API_ROOT + "/1/accessory/redirect?accessory_no=XL20220617090722WIBN",
			API_ROOT + "/1/accessory/redirect?accessory_no=XL20220617090735ZNLN",
			API_ROOT + "/1/accessory/redirect?accessory_no=XL20220617090746JVAN",
			API_ROOT + "/1/accessory/redirect?accessory_no=XL20220617090754IEND",
		],
		experienceVoucherData: [],
		isPhoneYes: false,
		payment: false,
		loading: false,
		longitude: "",
		latitude: "",
		// 遮罩层
		zzc_hidden: true,
		totalPage: 1, //总页数
		// 吸顶高度
		fixedHeight: wx.getStorageSync("statusBarHeight") +
			wx.getStorageSync("navigationBarHeight") +
			40 +
			"px",
		// 筛选栏距离顶部位置
		navbarInitTop: 0,
		isFixedTop: false,
		snfixed: false,
		//导航栏高度
		navigationBarAndStatusBarHeight: wx.getStorageSync("statusBarHeight") +
			wx.getStorageSync("navigationBarHeight"),
		// 导航分类列表
		catesList: [{
				icon: "/static/Group226.png",
				name: "美食"
			},
			{
				icon: "/static/xiaochi.png",
				name: "小吃"
			},
			{
				icon: "/static/naicha.png",
				name: "奶茶"
			},
			{
				icon: "/static/mingcha.png",
				name: "茗茶"
			},
			{
				icon: "/static/meijia.png",
				name: "美甲"
			},
			{
				icon: "/static/meirong.png",
				name: "美容"
			},
			{
				icon: "/static/fuzhuang.png",
				name: "服装"
			},
			{
				icon: "/static/quanbu.png",
				name: "全部"
			},
		],
		// 附近下拉选框选中索引
		currentIndex: 0,
		// 右边scroll-view 距离顶部的位置
		scrollTop: 0,
		leftArr: [],
		rightArr: [],
		pageData: [],
		middleGap: "20rpx",
		//筛选框数据
		selectionList: [{
				selectIndex: "0",
				name: "附近",
				isActive: false
			},
			// {
			// 	selectIndex: "1",
			// 	name: "美食",
			// 	isActive: false
			// },
			{
				selectIndex: "2",
				name: "智能排序",
				isActive: false
			},
			{
				selectIndex: "3",
				name: "筛选",
				isActive: false
			},
		],
	},
	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {
		// 发送给朋友
	    return {
	      title: '美点汇',
	      path: '/pages/home/home'
	    }
	},
	onShareTimeline:function(){
		// 分享到朋友圈
	    return {
	      title: '美点汇',
	      path: '/pages/home/home'
	    }
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		wx.setStorageSync("access_token", "");
		wx.login({
			success: (res) => {
				// 微信获取登录的code信息只能使用一次
				let code = res.code;
				this.getLoginInfo(code);
			},
		});
		wx.showShareMenu({
		  withShareTicket: true,
		  menus: ['shareAppMessage', 'shareTimeline']
		});
	},
	//上拉刷新
	onPullDownRefresh(){
		this.reset()
		this._getStoreNearby(); //商家列表
	},
	/**
	 * 上拉滑动
	 * @param {*} e
	 */
	onReachBottom(e) {
		// if (!this.authLocation) {
		//   return;
		// }
		this.addPageInfo();
	},
	onPageScroll(e) {
		if (!this.data.zzc_hidden && !this.handNavbar) {
			this.closeDropdown();
		}
		// 筛选框吸顶
		if (e.scrollTop >= this.data.navbarInitTop && !this.data.isFixedTop) {
			this.setData({
				isFixedTop: true,
			});
		} else if (e.scrollTop < this.data.navbarInitTop && this.data.isFixedTop) {
			this.setData({
				isFixedTop: false,
			});
		}
		// 导航栏吸顶
		if (
			e.scrollTop >= this.data.navigationBarAndStatusBarHeight &&
			!this.data.snfixed
		) {
			this.setData({
				snfixed: true,
			});
		} else if (
			e.scrollTop < this.data.navigationBarAndStatusBarHeight &&
			this.data.snfixed
		) {
			this.setData({
				snfixed: false,
			});
		}
		if (this.handNavbar) {
			this.handNavbar = false;
		}
	},
	onShow: function() {
		let that = this;
		if (that.data.navbarInitTop == 0) {
			//获取节点距离顶部的距离
			wx.createSelectorQuery()
				.select("#navbar")
				.boundingClientRect(function(rect) {
					if (rect && rect.top > 0) {
						let navbarInitTop = Math.ceil(
							rect.top - that.data.navigationBarAndStatusBarHeight + 1
						);
						that.setData({
							navbarInitTop: navbarInitTop,
						});
					}
				})
				.exec();
		}
		
		let accessToken = wx.getStorageSync("access_token");
		if(accessToken){
			this.reset()
			this._getStoreNearby(); //商家列表
			
			getUserInfo().then((e) => {
				this.setData({
					isPhoneYes: e.mobile ? true : false
				})
			})
			experienceVoucherList().then(res => {
				let resResult = res
				this.setData({
					experienceVoucherData: resResult
				})
			})
		}
	},
	goLook() {
		let arrId = this.data.experienceVoucherData.map(item=>item.id)
		let obj = {
			id: arrId.join(',')
		}
		toGetExperienceVoucher(obj).then(res => {
			this.setData({
				isPhoneYes: !this.data.isPhoneYes
			})
			wx.navigateTo({
				url: `/componentPages/couponsInfo/experienceVoucherDetail/index?info=${encodeURIComponent(JSON.stringify(this.data.experienceVoucherData))}`
			})
		})
	},
	showPopup() {
		this.setData({
			isPhoneYes: !this.data.isPhoneYes
		})
	},
	getphonenumber(e) {
		if (!e.detail.iv) {
			wx.showToast({
				icon: "none",
				title: "绑定手机失败,请重试",
				duration: 1500,
			});
			return;
		}
		let _this = this;
		_this.encryptedData = e.detail.encryptedData;
		_this.mobile = e.detail.iv;
		if (this.sessionKeyValid) {
			wx.checkSession({
				success() {
					// session_key 未过期
					_this.getmobile("");
				},
				fail() {
					// session_key
					wx.login({
						success(res) {
							_this.getmobile(res.code);
						},
					});
				},
			});
		} else {
			wx.login({
				success(res) {
					_this.getmobile(res.code);
				},
			});
		}
	},
	// 绑定手机号
	getmobile(code) {
		let _this = this;
		_this.setData({
			payment: true,
		});
		let param = {
			iv: _this.mobile,
			encrypted_data: _this.encryptedData,
			code: code,
		};
		myMobile(param)
			.then((res) => {
				wx.setStorageSync("access_token", res.access_token);
				_this.setData({
					sessionKeyValid: true,
					payment: false,
				});
				_this.goLook()
			})
			.catch((err) => {
				wx.showToast({
					title: err.error_msg,
					icon: "none",
				});
				_this.setData({
					sessionKeyValid: true,
					payment: false,
				});
			});
	},
	//登录
	getLoginInfo(code) {
		let _this = this;
		let param = {
			code: code
		};
		myLogin(param).then((res) => {
			wx.setStorageSync("access_token", res.access_token);
			this._getCatesList();
			// this._getFoodCatesList();
			this.reset()
			this._getStoreNearby();
			this.unit();
			
			getUserInfo().then((e) => {
				this.setData({
					isPhoneYes: e.mobile ? true : false
				})
			})
			experienceVoucherList().then(res => {
				let resResult = res
				this.setData({
					experienceVoucherData: resResult
				})
			})
		});
	},
	unit() {
		wx.getLocation({
			type: "gcj02",
			isHighAccuracy: true,
			highAccuracyExpireTime: 3000,
			success: (res) => {
				wx.setStorageSync("longitude", res.longitude);
				wx.setStorageSync("latitude", res.latitude);
				// this.storePageSort = "ASC";
				// this.storePageSortValue = "DISTANCE";
				// this.setData({
				//   authLocation: true,
				//   longitude: res.longitude,
				//   latitude: res.latitude,
				// });
				// this._getStoreNearby();
			},
			fail: (err) => {
				// this.setData({
				// authLocation: true,
				// longitude: wx.getStorageSync("longitude"),
				// latitude: wx.getStorageSync("latitude"),
				// });
				// this._getStoreNearby();
			},
		});
	},
	_getStoreNearby() {
		if (this.currentPage >= this.totalPage) {
			return;
		}
		this.setData({
			loading: false,
		});
		this.currentPage++;
		let param = {
			couponType: this.couponType,
			perCostStart: this.perCostStart,
			perCostEnd: this.perCostEnd,
			storeType: this.storeType,
			storeTypeN: this.storeTypeN,
			distance: this.distance,
			currentPage: this.currentPage,
			longitude: this.data.longitude,
			latitude: this.data.latitude,
			storePageSort: this.storePageSort,
			storePageSortValue: this.storePageSortValue,
		};
		getStoreNearby(param).then((res) => {
			this.totalPage = res.page_count;
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
				loading: true,
				leftArr,
				rightArr,
			});
		});
	},
	// _getFoodCatesList() {
	// 	const url = API_ROOT + "/1/store/type/all/defaulting";
	// 	post(url).then((res) => {
	// 		let foodList = [];
	// 		foodList = res.sublevel;
	// 		if(res.sublevel){
	// 			let foodItem = foodList[0].sublevel;
	// 			this.setData({
	// 				foodList,
	// 				foodItem,
	// 			});
	// 		}
	// 	});
	// },
	_getCatesList() {
		let param = {
			parentN: 0,
		};
		getCatesList(param).then((res) => {
			let obj = {
				name: "全部",
				icon: "/static/quanbu.png",
			};
			let dataArr = [];
			res.forEach((v, i) => {
				if (i < 7) {
					dataArr.push(v);
				}
			});
			dataArr.push(obj);
			this.setData({
				catesList: dataArr,
			});
		});
	},
	// 点击筛选框滚动到顶部
	scrollTo(e) {
		if (e.currentTarget.offsetTop > 0) {
			// 点击筛选框
			this.handNavbar = true;
			wx.pageScrollTo({
				scrollTop: e.currentTarget.offsetTop - this.data.navigationBarAndStatusBarHeight,
				duration: 0,
			});
		}
	},
	reset() {
		this.leftArr = [];
		this.rightArr = [];
		this.storeType = [];
		this.storeTypeN = [];
		this.couponType = "";
		this.perCostStart = "";
		this.perCostEnd = "";
		this.storePageSort = "DESC";
		this.storePageSortValue = "TIME";
		this.currentPage = 0;
		this.totalPage = 1;
		this.setData({
			longitude: wx.getStorageSync("longitude") || 0,
			latitude: wx.getStorageSync("latitude") || 0
		});
		
	},
	showMaskLayer(e) {
		this.setData({
			zzc_hidden: !e.detail,
		});
	},
	// 附近筛选框
	_getDistance(e) {
		this.reset();
		this.distance = e.detail;
		this.selectComponent("#waterfallFlow").resetListData();
		this.storePageSort = "ASC";
		this.storePageSortValue = "DISTANCE";
		this.setData({
			longitude: wx.getStorageSync("longitude"),
			latitude: wx.getStorageSync("latitude"),
		});
		this._getStoreNearby();
		this.setData({
			zzc_hidden: true,
		});
	},
	//美食筛选框
	_getFoodData(e) {
		this.reset();
		this.storeType = e.detail.storeType;
		this.storeTypeN = e.detail.number;
		this.selectComponent("#waterfallFlow").resetListData();
		this.selectComponent("#my_dropdown").onClose();
		this._getStoreNearby();
		this.setData({
			zzc_hidden: true,
		});
	},
	//智能排序筛选框
	_getsortdata(e) {
		this.reset();
		this.selectComponent("#waterfallFlow").resetListData();
		this.selectComponent("#my_dropdown").onClose();
		this.storePageSortValue = e.detail.value;
		this.storePageSort = e.detail.sort;
		if (this.storePageSortValue == "DISTANCE") {
			this.setData({
				longitude: wx.getStorageSync("longitude"),
				latitude: wx.getStorageSync("latitude"),
			});
		}
		this._getStoreNearby();
		this.setData({
			zzc_hidden: true,
		});
	},
	// 价格筛选排序
	_getPerCost(e) {
		this.reset();
		this.couponType = e.detail.couponType;
		this.perCostStart = e.detail.perCostStart;
		this.perCostEnd = e.detail.perCostEnd;
		this.selectComponent("#waterfallFlow").resetListData();
		this.storePageSortValue = "PRICE";
		this._getStoreNearby();
		this.setData({
			zzc_hidden: true,
		});
	},
	// 商家列表增加数据
	addPageInfo() {
		this._getStoreNearby();
	},
	// 获取点击事件
	test(data) {
		let number = data.detail.number;
		wx.navigateTo({
			url: "/componentPages/payEntrance/payEntrance?number=" + number,
		});
	},
	inputTap() {
		wx.navigateTo({
			url: "/componentPages/searchPage/searchPage",
		});
	},
	closeDropdown() {
		this.selectComponent("#my_dropdown").onClose("clear");
		this.setData({
			zzc_hidden: true,
		});
	},
});
