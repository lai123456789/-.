import {
  getLocationData,
  getUserInfo,
  createdOrder,
  prepaidOrder,
  getStoreInfo,
} from "../../../request/getData";
import {
  myLogin,
  myMobile
} from "../../../request/login";
import {
  _debounce
} from "../../../utils/util";

const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 预付款金额
    practical_amount: "0.00",
    sellerInfo: {},
    consumer_amount: "0.00",
    money: '',
    tColor: "#F93A4A",
    active: 2,
    canPay: false,
    //定位开关
    locationFlag: "",
    mobile: "",
    currency: "", //消费金
  },
  consoleN: '',
  longitude: "0",
  latitude: "0",
  /**
   * discount_array参数示列：
   * [{'discountType':'CONSUMER_AMOUNT','coupon_id':'TT32342'},{'discountType':'CONSUMER_AMOUNT','coupon_id':'4444'}]
   */
  discount_array: [{
    discountType: "CONSUMER_AMOUNT",
  }, ], //优惠项
  store_n: "", //商户id
  Code: "", //微信获取登录信息code
  access_token: "",
  encryptedData: "",
  order_n: "", // 订单编号
  pay_amount: "", // 实付金额
  // 刷新预支付信息
  refreshPrepaid: false,
  sessionKeyValid: false,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.refreshPrepaid = false
    this.consoleN = options.consoleN
    if (options.store_n) {
      app.globalData.store_n = options.store_n;
    }
    if (options.scene) {
      app.globalData.store_n = decodeURIComponent(options.scene);
    }
    wx.login({
      success: (res) => {
        // 微信获取登录的code信息只能使用一次
        let code = res.code;
        this.getLoginInfo(code);
      },
    });
  },
  onShow: function () {
    if (this.refreshPrepaid) {
      this._prepaidOrder();
      this.refreshPrepaid = false
    }
  },
  // 获取微信地理位置授权
  getLocationSetting() {
    wx.getSetting({
      success: (res) => {
        this.setData({
          locationFlag: res.authSetting["scope.userLocation"],
        });
      },
    });
  },
  // setLocation() {
  //   // 跳转设置页面
  //   wx.openSetting({
  //     success: (res) => {
  //       if (res.authSetting["scope.userLocation"]) {
  //         // 授权成功，重新定位
  //         wx.getLocation({
  //           success: (res) => {
  //             const {
  //               longitude,
  //               latitude
  //             } = res;
  //             this.longitude = longitude;
  //             this.latitude = latitude;
  //             this._getLocationData();
  //           },
  //         });
  //       }
  //     },
  //   });
  // },
  // _getLocationData() {
  //   let param = {
  //     longitude: this.longitude,
  //     latitude: this.latitude,
  //     storeN: app.globalData.store_n,
  //   };
  //   getLocationData(param).then((res) => {
  //     this.setData({
  //       canPay: res.canPay,
  //       locationFlag: true,
  //     });
  //   });
  // },
  //获取登录信息
  getLoginInfo(code) {
    let param = {
      code: code,
      store_n: app.globalData.store_n,
    };
    myLogin(param).then((res) => {
      wx.setStorageSync("access_token", res.access_token);
      this.getLocationSetting();
      // this.authLocation();
      this._prepaidOrder();
      this._getUserInfo();
      this._getStoreInfo(app.globalData.store_n);
    });
  },
  // 消费金订单
  _prepaidOrder(callback) {
    let param = {
      menu_console_n: this.consoleN,
      store_n: app.globalData.store_n,
      amount: '0',
      longitude: this.longitude,
      latitude: this.latitude,
      discount_array: JSON.stringify(this.discount_array),
    };
    // 消费金接口
    prepaidOrder(param).then((res) => {
      let practical_amount = (res.amount.practical_amount * 1).toFixed(2);
      let ought_amount = (res.amount.ought_amount * 1).toFixed(2);
      this.setData({
        money: ought_amount,
        practical_amount,
        consumer_amount: res.consumer_amount,
      });
      if(callback) {
        callback()
      }
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
      //使用消费金
      this.discount_array = [{
        discountType: "CONSUMER_AMOUNT",
      }, ];
      this._prepaidOrder();
    } else {
      this.discount_array = [];
      this._prepaidOrder();
    }
  },
  _getUserInfo() {
    getUserInfo().then((e) => {
      this.setData({
        mobile: e.mobile,
        nick_name: e.user.nick_name,
        currency: e.currency,
      });
    });
  },
  
  getphonenumber(e) {
    if(this.data.mobile) {
      this._createdOrder()
      return
    }
    if (!e.detail.iv) {
      wx.showToast({
        icon: "none",
        title: "绑定手机失败,请重试",
        duration: 1500,
      });
      return;
    }
    let _this = this;
    let encryptedData = e.detail.encryptedData;
    if (this.sessionKeyValid) {
      wx.checkSession({
        success() {
          // session_key 未过期
          _this.getmobile("", e.detail.iv, encryptedData);
        },
        fail() {
          // session_key
          wx.login({
            success(res) {
              _this.getmobile(res.code, e.detail.iv, encryptedData);
            },
          });
        },
      });
    } else {
      wx.login({
        success(res) {
          _this.getmobile(res.code, e.detail.iv, encryptedData);
        },
      });
    }
  },
  getmobile(code, iv, encryptedData) {
    let _this = this;
    _this.setData({
      payment: true,
    });
    let param = {
      iv: iv,
      encrypted_data: encryptedData,
      code: code,
    };
    myMobile(param)
      .then((res) => {
        wx.setStorageSync("access_token", res.access_token);
        _this._prepaidOrder(_this._createdOrder)
      })
      .catch((err) => {
        _this.setData({
          sessionKeyValid: true,
          payment: false,
        });
      });
  },
  _createdOrder() {
    let that = this;
    let param = {
      menu_console_n: this.consoleN,
      store_n: app.globalData.store_n,
      amount: this.data.money,
      longitude: this.longitude,
      latitude: this.latitude,
      discount_array: JSON.stringify(this.discount_array),
    };
    createdOrder(param)
      .then((r) => {
        this.order_n = r.order_n;
        this.pay_amount = r.amount;
        // 现金支付金额小于等于零时直接跳转到店铺详情页
        if (this.pay_amount * 1 <= 0) {
          wx.showToast({
            title: "消费金付款成功",
            icon: "none",
            duration: 2000,
          });
          setTimeout(() => {
            that._navigateBack();
          }, 1500);
        } else {
          this.refreshPrepaid = true
		  console.log("进入这里")
          wx.navigateTo({
            url: "../cash/index?money=" +
              this.data.practical_amount +
              "&order_n=" +
              this.order_n +
              "&pay_amount=" +
              this.pay_amount +
              "&consumer_amount=" +
              this.data.consumer_amount,
          });
        }
      })
      .catch((err) => {
        wx.showToast({
          icon: "none",
          title: err.error_msg,
        });
        return false;
      });
  },

  _navigateBack() {
    // 跳转至店铺详情页
    wx.redirectTo({
      url: "/componentPages/payEntrance/payEntrance?number=" +
        app.globalData.store_n +
        "&consumptionGold=" +
        this.data.consumer_amount +
        "&xfjpopup=true",
    });
  },

  _getStoreInfo(number) {
    let param = {
      number: number,
    };
    getStoreInfo(param)
      .then((res) => {
        app.globalData.storeLogo = res.logo;
        this.setData({
          sellerInfo: res,
        });
      })
      .catch((err) => {
        console.log(err, "err");
      });
  },
  // _debounce(),
  minput: _debounce(function (e) {
    let val = e[0].detail.value.toString();
    // if (val < 0.001) {
    //   wx.showToast({
    //     title: "输入的金额太小",
    //     icon: "none",
    //   });
    // }
    if (val.indexOf(".") == 0) {
      val = "0" + val;
    }
    val = val.replace(/[^\d.]/g, ""); //清除"数字"和"."以外的字符
    val = val.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的
    val = val.replace(/^0+\./g, "0.");
    val = val.match(/^0+[1-9]+/) ? (val = val.replace(/^0+/g, "")) : val;
    val = val.match(/^\d*(\.?\d{0,2})/g)[0] || "";
    val = val.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
    val = val.replace(/^(\-)*(\d+)\.(\d\d).*$/, "$1$2.$3"); //只能输入两个小数
    if (val.indexOf(".") < 0 && val != "") {
      //以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额
      val = parseFloat(val);
    }
    this.setData({
      money: val,
    });
    this._prepaidOrder();
  }, 1000),
});