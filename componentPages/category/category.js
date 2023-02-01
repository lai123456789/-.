import {
	request
} from "../../request/request";
import {
	getStoreNearby
} from "../../request/getData";
import {
	post,
	API_ROOT
} from "../../request/network";
const app = getApp();

Page({
	/**
	 * 页面的初始数据
	 */
	// 请求参数
	couponType: "", //优惠活动
	perCostStart: "", //人均消费-开始
	perCostEnd: "", //人均消费-结束
	storeType: "", //分类级别：FIRST, SECOND, THREE
	storeTypeN: "", //分类编号
	distance: "", //距离：纯数字，单位 m
	currentPage: 0,
	longitude: 0, //经度
	latitude: 0, //纬度
	storePageSort: "DESC", //排序规则：ASC(升序), DESC（降序）
	storePageSortValue: "TIME", //排序属性：DISTANCE（距离） PRICE（金额）SALES（销量）
	// 筛选框触发
	handNavbar: false,
	data: {
		// banner图列表
		bannerList: [
			API_ROOT + "/1/accessory/redirect?accessory_no=XL20220617091049UZKL",
			API_ROOT + "/1/accessory/redirect?accessory_no=XL20220617091059LTYB",
			API_ROOT + "/1/accessory/redirect?accessory_no=XL20220617091108NVYT",
		],
		longitude: 0, //经度
		latitude: 0, //纬度
		// 遮罩层
		zzc_hidden: true,
		loading: false,
		totalPage: 1,
		pageData: [],
		leftArr: [],
		rightArr: [],
		middleGap: "20rpx",
		isFixedTop: false,
		// 筛选栏距离顶部位置
		navbarInitTop: 0,
		fixedHeight: "40px",
		navigationBarAndStatusBarHeight: wx.getStorageSync("statusBarHeight") +
			wx.getStorageSync("navigationBarHeight"),
		selectionList: [{
				selectIndex: "0",
				name: "附近",
				isActive: false,
			},
			{
				selectIndex: "2",
				name: "智能排序",
				isActive: false,
			},
			{
				selectIndex: "3",
				name: "筛选",
				isActive: false,
			},
		],
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		let title = options.title || "分类";
		wx.setNavigationBarTitle({
			title: title,
		});
		this.reset();
		if (options.number !== "") {
			this.storeType = "FIRST";
			this.storeTypeN = options.number;
			this._getStoreList();
		} else {
			this._getStoreList();
		}
	},
	onPageScroll: function(e) {
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
						let navbarInitTop = parseInt(
							rect.top - that.data.navigationBarAndStatusBarHeight
						);
						that.setData({
							navbarInitTop: navbarInitTop,
						});
					}
				})
				.exec();
		}
	},
	reset() {
		this.leftArr = [];
		this.rightArr = [];
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
		this._getStoreList();
		this.setData({
			zzc_hidden: true,
		});
	},
	//价格筛选框
	_getPerCost(e) {
		this.reset();
		this.couponType = e.detail.couponType;
		this.perCostStart = e.detail.perCostStart;
		this.perCostEnd = e.detail.perCostEnd;
		this.selectComponent("#waterfallFlow").resetListData();
		this.storePageSortValue = "PRICE";
		this._getStoreList();
		this.setData({
			zzc_hidden: true,
		});
	},
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
		this._getStoreList();
		this.setData({
			zzc_hidden: true,
		});
	},
	showMaskLayer(e) {
		this.setData({
			zzc_hidden: !e.detail,
		});
	},
	myDropDownClose(e) {
		this.setData({
			isFixedTop: false,
		});
	},
	scrollTo(e) {
		let offsetTop = e.currentTarget.offsetTop;
		if (e.currentTarget.offsetTop > 0) {
			// 点击筛选框
			this.handNavbar = true;
			wx.pageScrollTo({
				scrollTop: offsetTop,
				duration: 0,
			});
		}
	},
	onReachBottom() {
		this.addPageInfo();
	},
	// 商家列表增加数据
	addPageInfo() {
		this._getStoreList();
	},
	_getStoreList() {
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
			this.setData({
				loading: true,
			});
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
				leftArr,
				rightArr,
			});
		});
	},
	test(data) {
		let number = data.detail.number;
		wx.navigateTo({
			url: "/componentPages/payEntrance/payEntrance?number=" + number,
		});
	},
	closeDropdown() {
		this.selectComponent("#my_dropdown").onClose("clear");
		this.setData({
			zzc_hidden: true,
		});
	},
});
