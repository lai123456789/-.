import {
	request
} from "../../request/request";
import {
	post,
	API_ROOT
} from "../../request/network";
import {
	_debounce
} from "../../utils/util";
import {
	getStoreNearby,
} from "../../request/getData";
Page({
	/**
	 * 页面的初始数据
	 */
	leftArr: [],
	rightArr: [],
	// 请求参数
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
		// 数据集
		dataList: [],
		//全部类型
		typeList: [{
				value: "all",
				text: "全部类型",
				sort: "ASC",
			}, {
				value: "youhuiquan",
				text: "优惠券",
				sort: "ASC",
			}
		],
		//智能排序
		IntelligentIndex: "",
		IntelligentSortArr: [{
				value: "TIME",
				text: "智能排序",
				sort: "ASC",
			},
			{
				value: "DISTANCE",
				text: "距离优先",
				sort: "ASC",
			},
			{
				value: "SALES",
				text: "销量优先",
				sort: "DESC",
			},
			{
				value: "PRICE",
				text: "低价优先",
				sort: "ASC",
			},
			{
				value: "PRICE",
				text: "高价优先",
				sort: "DESC",
			},
		],
		distanceIndex: 0,
		distance: [{
				text: "附近",
				value: "",
			},
			{
				text: "500m",
				value: "500",
			},
			{
				text: "3km",
				value: "3000",
			},
			{
				text: "5km",
				value: "5000",
			},
			{
				text: "10km",
				value: "10000",
			},
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
			{
				selectIndex: "1",
				name: "全部类型",
				isActive: false
			},
			{
				selectIndex: "2",
				name: "全部品类",
				isActive: false
			},
			{
				selectIndex: "3",
				name: "智能排序",
				isActive: false
			},
		],
	},
	// 取消收藏
	cancelTheCollection(e) {
		let data = e.currentTarget.dataset
		let that = this;
		wx.showModal({
			title: "确定删除该收藏？",
			cancelText: '否',
			confirmText: '是',
			success(res) {
				if (res.confirm) {
					let param = { 
						coupon_voucher_n: data.number //'CV251QDP20220615115833460'
					}
					post(API_ROOT + '/1/account/coupon/voucher/collect/del',param).then(res => {
						wx.showToast({
							icon: "none",
							title: '成功删除了1条收藏',
						});
						that.setData({
							dataList: []
						})
						that.getCollectionList(); // 刷新列表
					})
				}
			},
		});
	},
	goInfo(e) {
		// 根据类型 跳转 商家或者优惠券详情 页面
		let data = e.currentTarget.dataset
		// let url = data.type === '优惠券' ? `/componentPages/payEntrance/payEntrance?number=${number}` :
		// 	`/componentPages/payEntrance/payEntrance?number=${number}`
		let url = "/componentPages/cashCouponDetail/cashCouponDetail?number="+data.number
		wx.navigateTo({
			url: url
		});
	},
	closeDropdown() {
		this.setData({
			zzc_hidden: true,
			show: false
		});
	},
	showPopup(e) {
		console.log("eeeee", e)
		console.log("this.data.showIndex", this.data.showIndex)
		let {
			index
		} = e.currentTarget.dataset;
		let show = this.data.showIndex == index ? !this.data.show : true;
		// let showIndex = index == this.data.showIndex ? "" : index;
		let showIndex = index;
		// this.triggerEvent("showmasklayer", show);
		this.setData({
			show,
			showIndex,
			zzc_hidden: !show,
		});
		// }
	},
	close(e) {
		let number = e.currentTarget.dataset.number
		this.selectComponent('#item' + number).toggle()
	},
	reset() {
		this.leftArr = [];
		this.rightArr = [];
		this.storeType = [];
		this.storeTypeN = [];
		this.perCostStart = "";
		this.perCostEnd = "";
		this.storePageSort = "DESC";
		this.storePageSortValue = "TIME";
		this.currentPage = 0;
		this.totalPage = 1;
		this.setData({
			longitude: 0,
			latitude: 0,
		});
	},
	// 点击类型 传参 待优化 还没改完
	getType(e) {
		let showIndex;
		if (this.data.selectionList.length == 4) {
			//如果筛选框有美食分类
			showIndex = this.data.showIndex;
		} else {
			//  如果没有美食分类
			showIndex = 1;
		}
		let {
			index,
			data
		} = e.currentTarget.dataset;
		let near = "selectionList[" + showIndex + "].name";
		this.setData({
			[near]: data.text,
			show: false,
			// IntelligentIndex: index,
			// priceIndex: "",
			// distanceIndex: "",
		});
		this.reset();
		let formdata = e.currentTarget.dataset.data
		// this.storePageSortValue = formdata.value;
		// this.storePageSort = formdata.sort;
		this._getStoreNearby();
		this.setData({
			zzc_hidden: true,
		});
	},
	getDistance(e) {
		let index = this.data.showIndex;
		let near = "selectionList[0].name";
		this.setData({
			[near]: e.currentTarget.dataset.text,
			show: false,
			distanceIndex: e.currentTarget.dataset.index,
			priceIndex: "",
			IntelligentIndex: "",
		});
		// this.triggerEvent("getdistancechange", e.currentTarget.dataset.value);
		this.reset();
		this.distance = e.currentTarget.dataset.value;
		// this.selectComponent("#waterfallFlow").resetListData();
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
	_getStoreNearby() {
		if (this.currentPage >= this.totalPage) {
			return;
		}
		this.setData({
			loading: false,
		});
		this.currentPage++;
		let param = {
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
			this.setData({
				// dataList: [{
				// 	text: '优惠券',
				// 	text: '商户'
				// }]
			})
			// let leftArr = this.leftArr,
			// 	rightArr = this.rightArr,
			// 	data = res.records;
			// if (data.length != 0) {
			// 	data.forEach((ele, i) => {
			// 		ele.distance = (ele.distance / 1000).toFixed(1);
			// 		if (i == 0 || i % 2 == 0) {
			// 			leftArr.push(ele);
			// 		} else {
			// 			rightArr.push(ele);
			// 		}
			// 	});
			// }
			// this.setData({
			// 	pageData: data,
			// 	loading: true,
			// 	leftArr,
			// 	rightArr,
			// });
		});
	},
	_getFoodCatesList() {
		const url = API_ROOT + "/1/store/type/all/defaulting";
		post(url).then((res) => {
			let foodList = [];
			foodList = res.sublevel;
			let foodItem = foodList[0].sublevel;
			this.setData({
				foodList,
				foodItem,
			});
		});
	},
	foodItemTap(e) {
		let {
			index
		} = e.currentTarget.dataset;
		let foodItem = this.data.foodList[index].sublevel;
		this.setData({
			foodIndex: index,
			foodItem,
			priceIndex: "",
			scrollTop: 0,
		});
	},
	getFoodData(e) {
		let showIndex = this.data.showIndex;
		this.triggerEvent("getfooddata", e.currentTarget.dataset.data);
		let {
			index,
			data
		} = e.currentTarget.dataset;
		let near = "selectionList[" + showIndex + "].name";
		this.setData({
			[near]: e.currentTarget.dataset.data.name,
			foodItemIndex: index,
		});
		this.reset();
		this.storeType = data.storeType;
		this.storeTypeN = data.number;
		// this.selectComponent("#waterfallFlow").resetListData();
		// this.selectComponent("#my_dropdown").onClose();
		this._getStoreNearby();
		this.setData({
			zzc_hidden: true, //true, !this.data.zzc_hidden
			show: false
		});
		console.log("zzc_hiddenzzc_hiddenzzc_hidden", this.data.zzc_hidden)
	},
	getIntelligentSortData(e) {
		let showIndex;
		if (this.data.selectionList.length == 4) {
			//如果筛选框有美食分类
			showIndex = this.data.showIndex;
		} else {
			//  如果没有美食分类
			showIndex = 1;
		}
		let {
			index,
			data
		} = e.currentTarget.dataset;
		let near = "selectionList[" + showIndex + "].name";
		this.setData({
			[near]: data.text,
			show: false,
			IntelligentIndex: index,
			priceIndex: "",
			distanceIndex: "",
		});
		// this.triggerEvent("getsortdata", e.currentTarget.dataset.data);
		this.reset();
		// this.selectComponent("#waterfallFlow").resetListData();
		// this.selectComponent("#my_dropdown").onClose();
		let formdata = e.currentTarget.dataset.data
		this.storePageSortValue = formdata.value;
		this.storePageSort = formdata.sort;
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
	goBuy(e) {
		// 跳购买代金券页面
		let { vouchers } = e.currentTarget.dataset
		let obj = {logo:vouchers.logo,bannerList:[vouchers.logo],name:vouchers.storeName}//this.data.sellerInfo
		wx.navigateTo({
			url: `/componentPages/buyCashCoupon/buyCashCoupon?sellerInfo=${encodeURIComponent(JSON.stringify(obj))}&vouchersInfo=${encodeURIComponent(JSON.stringify(vouchers))}`
		});
	},
	getCollectionList() {
		const url = API_ROOT + "/1/account/coupon/voucher/collect/list"
		post(url).then((res) => {
			this.setData({
				dataList: res || []
			})
		});
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		// this._getFoodCatesList()  筛选的食物种类
		this.getCollectionList()
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
