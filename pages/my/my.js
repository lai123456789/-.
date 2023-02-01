import {
	getStoreNearby,
	getUserInfo,
	modifyUserInfo,
} from "../../request/getData";
import {
	myMobile
} from "../../request/login";
import drawQrcode from "../../utils/qrCode.js"
import { post, API_ROOT } from '../../request/network'
import {
	getQrcodeMp
  } from '../../utils/setting';
  const app = getApp()
Page({
	/**
	 * 页面的初始数据
	 */
	leftArr: [],
	rightArr: [],
	sessionKeyValid: false,
	currentPage: 0,
	totalPage: 1, //总页数
	data: {
		API_ROOT,
		showPopup: false,
		mobilePhone: "",
		isPhoneYes: false,
		middleGap: "20rpx",
		closeSwitch: false,
		nick_name: "",
		account_n: "",
		currency: "",
		head_portrait: "/static/yhtx.png",
		authorization: true,
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {},
	onShow: function() {
		this._getUserInfo();
		this.reset()
		this._getStoreNearby();
	},
	reset() {
		this.leftArr = [];
		this.rightArr = [];
		this.storePageSort = "DESC";
		this.storePageSortValue = "TIME";
		this.currentPage = 0;
		this.totalPage = 1;
	},
	functionUpdate() {
		wx.navigateTo({
			url: "/componentPages/expenseBill/expenseBill",
		});
	},
	test(data) {
		let number = data.detail.number;
		wx.navigateTo({
			url: "/componentPages/payEntrance/payEntrance?number=" + number,
		});
	},
	lookCode(){
		//查看会员码 也是手机号码 生成的图片
		this.ewmChange(this.data.mobilePhone)
		this.setData({
			showPopup: true
		})
	},
	showPopup(){
		this.setData({
			showPopup: false
		})
	},
	//前端生成二维码
	ewmChange(text) {
		let size = {}
		size.w = wx.getSystemInfoSync().windowWidth / 750 * 362
		size.h = size.w
		drawQrcode({
			width: size.w,
			height: size.h,
			canvasId: 'myQrcodeVIP',
			text: text,
		})
	},
	getUserProfile() {
		let that = this;
		wx.getUserProfile({
			desc: "desc",
			lang: "zh_CN",
			success: (s) => {
				const {
					nickName,
					avatarUrl
				} = s.userInfo;
				that.setData({
					nick_name: nickName,
					head_portrait: avatarUrl,
				});
				that._modifyUserInfo(nickName, avatarUrl);
				that._getUserInfo();
			},
		});
	},
	_getUserInfo() {
		getUserInfo().then((e) => {
			let nick_name = e.user.nick_name;
			let authorization = nick_name == "" ? true : false;
			if (!nick_name) {
				this.setData({
					authorization,
				});
			} else {
				let currency = e.currency.toFixed(2);
				let account_n = e.user.account_n.substring(
					e.user.account_n.length - 6,
					e.user.account_n.length
				);
				this.setData({
					nick_name: e.user.nick_name,
					head_portrait: e.user.head_portrait,
					account_n,
					currency,
					authorization,
				});
			}
			if(e.mobile){
				this.setData({
					isPhoneYes: true,
					mobilePhone: e.mobile
				})
			}
		});
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
	/**
	 * 上拉滑动
	 * @param {*} e
	 */
	onReachBottom(e) {
		this._getStoreNearby();
	},
	_getStoreNearby() {
		if (this.currentPage >= this.totalPage) {
			return;
		}
		this.currentPage++;
		let param = {
			currentPage: this.currentPage,
			storePageSort: "DESC",
			storePageSortValue: "TIME",
		};
		getStoreNearby(param).then((res) => {
			console.log(res);
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
				leftArr,
				rightArr,
			});
		});
	},
	//写入用户信息
	_modifyUserInfo(nickName, avatarUrl) {
		let that = this;
		let param = {
			head_portrait: avatarUrl,
			nick_name: nickName,
		};
		modifyUserInfo(param).then((res) => {
			that._getUserInfo();
		});
	},
	onClose() {
		this.setData({
			closeSwitch: true,
		});
	},
	// 卡券
	cardVoucher() {
		console.log("ewfwefwae")
		wx.navigateTo({
			url: "/componentPages/couponsInfo/cardVoucher/index",
		});
	},
	// 收藏
	collection() {
		console.log("eweee")
		wx.navigateTo({
			url: "/componentPages/collection/index",
		});
	},
	// 关于我们
	aboutUs() {
		wx.navigateTo({
			url: "/componentPages/aboutUs/aboutUs",
		});
	},
	// 联系我们
	contactUs() {
		wx.navigateTo({
			url: "/componentPages/contactUs/contactUs",
		});
	},
	// 商家端登录
	merchantlogin() {
		wx.navigateToMiniProgram({
			appId: "wxe63dbe285bbbd789",
			path: "pages/login/index",
		});
	},
	// 商家入驻
	tenants() {
		wx.navigateToMiniProgram({
			appId: "wxe63dbe285bbbd789",
			path: "pages/regist/index",
		});
	},
	// 招募地推
	recruit() {
		wx.showToast({
			title: "功能正在升级中",
			icon: "none",
		});
	},
	// 去关注
	focusOn() {
		wx.navigateTo({
			url: "/componentPages/public/public",
		});
	},
	  // 扫描
	  _clickScan: function (e) {
		let that = this
		app.globalData.consoleType = 'CONSUMER'
		wx.scanCode({
		  success(result) {
			console.log("scan qrcode: ", result.result)
			let url = decodeURIComponent(result.result);
			let paramer = url.split("?no=");
			let qrcode_no = paramer[1];
			// let qrcode_no = "QR2021121110023689MC";
			if(!qrcode_no) {
			  wx.showToast({
				title: '请扫描桌台二维码进行点餐',
				icon: 'none',
				duration: 2000
			  })
			  return
			}
			getQrcodeMp(qrcode_no).then(data => {
			  if (data.target_type != 'USER_SEAT_HOME') {
				wx.showToast({
				  title: '请扫描桌台二维码进行点餐',
				  icon: 'none',
				  duration: 2000
				})
				return
			  }
			  let targetParam = JSON.parse(data.target_param)
			  let storeN = targetParam.store_n;
			  let seats_n = targetParam.seats_n
			  app.globalData.store_n = storeN
			  wx.redirectTo({
				url: '/pages/choose/people/index?seatsN=' + seats_n
			  })
			});
		  }
		})
	  },
});
