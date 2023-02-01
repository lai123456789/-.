import {
	getStoreNearby
} from "../../../request/getData";
import {
	post,
	API_ROOT
} from "../../../request/network";
import drawQrcode from "../../../utils/qrCode.js"
Page({
	leftArr: [],
	rightArr: [],
	couponNumber: '',
	/**
	 * 页面的初始数据
	 */
	data: {
		API_ROOT,
		text: "",
		dataInfo: {},
		numberList: ['1370 2264 2294', '1370 2264 2295', '1370 2264 2296', '1370 2264 2296'],
		showMore: false,
		showMoreRule: false,
		///相关推荐的 瀑布流组件 属性如下
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
		////////如上
	},
	goUse(){
		wx.navigateTo({
			url: '/componentPages/cashCouponDetail/cashCouponDetail?number=' + this.couponNumber //代金券优惠券详情页
		});
	},
	toApplyRefund(e) {
		let {snlength} = e.currentTarget.dataset
		let dataInfo = {...this.data.dataInfo,...{snlength}}
		wx.navigateTo({
			url: '/componentPages/couponsInfo/toApplyRefund/toApplyRefund?dataInfo='+encodeURIComponent(JSON.stringify(dataInfo))
		});
	},
	listToggle: function() {
		this.setData({
			showMore: !this.data.showMore
		})
	},
	ruleToggle: function() {
		this.setData({
			showMoreRule: !this.data.showMoreRule
		})
	},
	getList() {
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
	getVoucherInfo(sn) {
		let param = {
			sn
		}
		post(API_ROOT + '/1/coupon/buyCouponInfo', param).then(res => {
			this.ewmChange(res.sn)
			let numberList = res.snList.filter(item=>item.sn===sn)
			let dataInfo = res;
			// 使用时间
			if(dataInfo.useTimeLimit !== "[{}]"){
				dataInfo.useTimeLimit = JSON.parse(dataInfo.useTimeLimit)
				dataInfo.useTimeLimit.forEach((item,index) => {
					item.useTime = item.useTime.join('-')
				})
			}
			// 不可用日期
			if(dataInfo.unavailableDateLimit !== "[{}]"){
				dataInfo.unavailableDateLimit = JSON.parse(dataInfo.unavailableDateLimit)
				dataInfo.unavailableDateLimit.forEach((item,index) => {
					item.unavailableTime = item.unavailableTime.join('至')
				})
			}
			// 不适用范围
			dataInfo.unavailableLimit = JSON.parse(dataInfo.unavailableLimit)
			// 使用规则
			dataInfo.useRules = JSON.parse(dataInfo.useRules)
			this.setData({
				numberList,
				dataInfo
			})
		})
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.couponNumber = options.number
		this.getList();
		
		this.getVoucherInfo(options.sn)
	},
	callPhone(e){
		wx.makePhoneCall({
			phoneNumber: e.currentTarget.dataset.phone,
		}).catch((e) => {
			console.log(e);
		});
	},
	//前端生成二维码
	ewmChange(text) {
		let size = {}
		size.w = wx.getSystemInfoSync().windowWidth / 750 * 262
		size.h = size.w
		drawQrcode({
			width: size.w,
			height: size.h,
			canvasId: 'myQrcode',
			text: text,
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
		this.getList();
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function() {

	}
})
