import {
	getStoreNearby,
	getUserInfo
} from "../../request/getData";
import {
	post,
	API_ROOT
} from '../../request/network'
Page({
	leftArr: [],
	rightArr: [],
	currentPage: 0,
	totalPage: 1, //总页数
	optionsObj: {},
	data: {
		API_ROOT,
		currency: "", //消费金
		middleGap: "20rpx",
		pageInfo: [],
		pageData: [],
		pageDataPayShop: [],
		// 消费金弹窗
		xfjpopup: false,
		// 遮罩层
		zzc_hidden: false,
		consumptionGold: "",
		active: 0,
	},
	functionUpdate: function() {
		// wx.showToast({
		//   title: '功能升级中',
		//   icon: 'none'
		// })
		wx.navigateTo({
			url: "/componentPages/expenseBill/expenseBill",
		});
	},
	_getUserInfo() {
		getUserInfo().then((e) => {
			let currency = e.currency.toFixed(2);
			this.setData({
				nick_name: e.user.nick_name,
				currency,
			});
		});
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.optionsObj = options
		this.setData({
			consumptionGold: options.consumptionGold,
			xfjpopup: options.xfjpopup,
			zzc_hidden: !options.xfjpopup,
		});
		
		// 商家付款之后 跳到这里弹窗显示 推荐的商家 显示10个附近的商家
		if(this.optionsObj.number){
			let param = {
				type: 2,//1-优惠券 2-消费金 3-最新
				storeN: this.optionsObj.number || "",//上个页面支付完成后 店铺的编号 store_n 例如SN1655714681227
				distance: "",//上个页面支付完成后 店铺的距离 可不传
				currentPage: this.currentPage,
			};
			post(API_ROOT + '/1/store/consumePage',param).then(res => {
				let data = []
				if(res.records.length > 0){
					data = res.records.slice(0,10)
				}
				this.setData({
					pageDataPayShop: data
				});
			})
		}
	},
	reset() {
		this.leftArr = [];
		this.rightArr = [];
		this.currentPage = 0
		this.totalPage = 1
	},
	onChange(event) {
		this.reset()
		let index = event.detail.name
		this.setData({
			active: event.detail.name
		})
		this._getStoreNearby()
	},
	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {
		this.reset()
		this._getStoreNearby();
		this._getUserInfo();
	},
	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function() {
		this._getStoreNearby();
	},
	onPageScroll: function(e) {
		if (!this.data.zzc_hidden) {
			this.goGold();
		}
	},
	lookShop(data) {
		let number = data.detail.number;
		wx.navigateTo({
			url: "/componentPages/payEntrance/payEntrance?number=" + number,
		});
	},
	goInfo(e) {
		this.goGold()
		setTimeout(() => {
			let number = e.currentTarget.dataset.number;
			wx.navigateTo({
				url: "/componentPages/payEntrance/payEntrance?number=" + number,
			});
		},800)
	},
	_getStoreNearby() {
		if (this.currentPage >= this.totalPage) {
			return;
		}
		this.currentPage++;
		let type = this.data.active + 1
		let param = {
			type: this.data.active + 1,//1-优惠券 2-消费金 3-最新
			storeN: this.optionsObj.number || "",//上个页面支付完成后 店铺的编号
			distance: "",//上个页面支付完成后 店铺的距离 可不传
			currentPage: this.currentPage,
		};
		post(API_ROOT + '/1/store/consumePage',param).then(res => {
			this.totalPage = res.page_count;
			let leftArr = this.leftArr,
				rightArr = this.rightArr,
				data = res.records
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
			// this.currentPage = res.page_count
			this.setData({
				pageData: data,
				leftArr,
				rightArr,
			});
		})
		// getStoreNearby(param).then((res) => {
			
		// });
	},
	goRules() {
		wx.navigateTo({
			url: "/componentPages/rules/rules",
		});
	},
	goGold() {
		this._getUserInfo();
		this.setData({
			xfjpopup: false,
			zzc_hidden: true,
		});
	},
});
