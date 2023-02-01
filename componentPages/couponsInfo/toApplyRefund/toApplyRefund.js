import {
	post,
	API_ROOT
} from '../../../request/network'
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		API_ROOT,
		refund_amount: '',
		service_charge: '',//  比例
		fee_amount:'',//   具体金额
		dataInfo: {},
		businessReason: '商家原因',
		personalReasons: '个人原因',
		reasonIndex: 0,
		num: 1,
		show: false,
		radio: '1',
		resultList: [],
		selectResult: ''
	},
	onChangeRadio(e) {
		let {
			index,
			name
		} = e.currentTarget.dataset
		this.setData({
			radio: index,
			selectResult: name
		});
	},
	onClose() {
		this.setData({
			show: false
		});
	},
	selectCard(e) {
		// 0-商家 1-个人
		let {
			index
		} = e.currentTarget.dataset
		let nameList = []
		if (index == 0) {
			nameList = [{
					name: '联系不上商家'
				},
				{
					name: '商家说可以直接以团购价格到店消费'
				},
				{
					name: '其他平台/店内更优惠'
				},
				{
					name: '商家服务态度差/区别对待，其他优惠券不想要了'
				},
				{
					name: '预约不上'
				},
				{
					name: '购买页面与实际服务不一致'
				},
				{
					name: '商家没营业/停业装修'
				},
				{
					name: '商家营业但不接待'
				},
				{
					name: '商家建议其他方式购买'
				}
			]
		} else {
			nameList = [{
					name: '买错了/买多了/不想要了'
				},
				{
					name: '疫情影响，无法前往'
				},
				{
					name: '没看清楚使用规则，要用时发现限制较多'
				},
				{
					name: '过期退款'
				}
			]
		}
		this.setData({
			show: true,
			reasonIndex: index,
			resultList: nameList,
		});
	},
	// 选择原因确定
	quedingTui() {
		if(!this.data.selectResult){
			// 没有选择对应的原因
			this.setData({
				businessReason: '商家原因',
				personalReasons: '个人原因',
				show: false
			})
			return
		}
		// 选择商家或个人原因的某一项
		if (this.data.reasonIndex == 0) {
			// 商家原因
			this.setData({
				businessReason: this.data.selectResult,
				personalReasons: '个人原因',
			})
		} else {
			// 个人原因
			this.setData({
				businessReason: '商家原因',
				personalReasons: this.data.selectResult,
			})
		}
		this.setData({
			show: false
		});
	},
	goRefund() {
		if(this.data.refund_amount == '0.00'){
			wx.showToast({
			  title: "退款金额为0，无法发起申请退款",
			  icon: "none"
			});
			return
		}
		if(this.data.businessReason === '商家原因' && this.data.personalReasons === '个人原因'){
			wx.showToast({
			  title: "请选择一项退款原因",
			  icon: "none"
			});
			return
		}
		// 申请退款按钮
		//申请退款 成功跳转代金券核销详情列表页
		let param = {
			sn: this.data.dataInfo.sn,
			remark: this.data.selectResult
		}
		post(API_ROOT + '/1/order/refund/submit', param).then(res => {
			let that = this
			wx.showModal({
				title: "退款成功",
				showCancel: false,
				confirmText: '知道了',
				success(res) {
					if (res.confirm) {
						let pages = getCurrentPages(); //获取小程序页面栈
						if(that.data.dataInfo.snlength === 1){
							// 核销列表 剩一张的情况下  直接跳回我的卡券列表页
							let beforePage1 = pages[pages.length - 3]; //获取上个页面的实例对象
							beforePage1.getList(1); //触发上个页面自定义的getVoucherInfo方法
							wx.navigateBack({
								delta: 2
							})
						}else{
							//剩下超过1张的情况下  返回上一页
							let beforePage2 = pages[pages.length - 2]; //获取上个页面的实例对象
							beforePage2.getVoucherInfo(that.data.dataInfo.sn); //触发上个页面自定义的getVoucherInfo方法
							wx.navigateBack({
								delta: 1
							})
						}
					}
				},
			});
		}).catch(err => {
		})
	},
	jian() {
		this.minput(null, this.data.num - 1)
	},
	add() {
		this.minput(null, this.data.num + 1)
	},
	minput(e, value) {
		this.setData({
			num: 1
		})
		// let num = e && e.detail ? Number(e.detail.value) : Number(value)
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
		let dataInfo = JSON.parse(decodeURIComponent(options.dataInfo))
		this.setData({
			dataInfo
		})
		this.getRefuseInfo(dataInfo.sn)
	},
	getRefuseInfo(sn){
		let param = { sn }
		post(API_ROOT + '/1/order/refund/info',param).then(res => {
			this.setData({
				refund_amount: res.refund_amount,
				service_charge: res.service_charge,//  比例
				fee_amount: res.fee_amount//   具体金额
			})
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
