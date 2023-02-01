import {
  getLocationData,
  getUserInfo,
  createdOrder,
  modifyUserInfo,
  prepaidOrder,
  getStoreInfo,
} from "../../request/getData";
import {
  myLogin,
  myMobile
} from "../../request/login";
import {
  _debounce
} from "../../utils/util";
import {
  post,
  API_ROOT
} from '../../request/network'
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    API_ROOT,
    // 预付款金额
    practical_amount: "0.00",
    sellerInfo: {},
    consumer_amount: "0.00",
    money: 0,
    tColor: "#F93A4A",
    active: 2,
    canPay: false,
    //定位开关
    locationFlag: "",
    nick_name: "", //昵称
    mobile: "",
    currency: "", //消费金
    //付款按钮
    payment: false,
  },
  sessionKeyValid: false,
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
  mobile: "",
  encryptedData: "",
  order_n: "", // 订单编号
  pay_amount: "", // 实付金额
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
  // authLocation() {
  //   wx.getLocation({
  //     type: "gcj02",
  //     isHighAccuracy: true,
  //     highAccuracyExpireTime: 3000,
  //     success: (res) => {
  //       const {
  //         longitude,
  //         latitude
  //       } = res;
  //       this.longitude = longitude;
  //       this.latitude = latitude;
  //       this._getLocationData();
  //     },
  //     fail: (e) => {
  //       // 判断用户是否拒绝了授权
  //       this.setData({
  //         locationFlag: false,
  //       });
  //     },
  //   });
  // },
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
      this._getUserInfo();
      this._getStoreInfo(app.globalData.store_n);
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
      that.data.nick_name = nickName;
      that._createdOrder();
    });
  },
  // 消费金订单
  _prepaidOrder(callback) {
    if (!this.data.money) {
      this.setData({
        practical_amount: "0.00",
        consumer_amount: "0.00",
      });
      return;
    }
    let param = {
      store_n: app.globalData.store_n,
      amount: this.data.money,
      longitude: this.longitude,
      latitude: this.latitude,
      discount_array: JSON.stringify(this.discount_array),
    };
    // 消费金接口
    prepaidOrder(param).then((res) => {
      let practical_amount = (res.amount.practical_amount * 1).toFixed(2),
        consumer_amount = (res.consumer_amount * 1).toFixed(2);
      this.setData({
        practical_amount,
        consumer_amount,
      });
      if(callback) {
        callback()
      }
    });
  },
  // 是否使用消费金
  usePreferential(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({
      active: index,
    });
    if (index == 2) {
      //使用消费金
      this.discount_array = [
        {
          discountType: "CONSUMER_AMOUNT",
        },
      ];
      this._prepaidOrder();
    } else {
      this.discount_array = [];
      this._prepaidOrder();
    }
  },
  _getUserInfo() {
    getUserInfo().then((e) => {
      this.mobile = e.mobile;
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
        // _this._getUserInfo()
        // _this._prepaidOrder()
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
    // if (!this.data.nick_name) {
    //   //无昵称获取用户信息更新平台用户信息
    //   wx.getUserProfile({
    //     desc: "desc",
    //     lang: "zh_CN",
    //     success: (s) => {
    //       const {
    //         nickName,
    //         avatarUrl
    //       } = s.userInfo;
    //       that._modifyUserInfo(nickName, avatarUrl);
    //     },
    //   });
    //   return;
    // }
    let param = {
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
            // that._navigateBack();
            wx.reLaunch({
              url: "/pages/gold/gold?number=" +
                app.globalData.store_n +
                "&consumptionGold=" +
                this.data.consumer_amount +
                "&xfjpopup=true",
            });
          }, 1500);
        } else {
          wx.redirectTo({
            url: "/componentPages/cash/cash?money=" +
              this.data.practical_amount +
              "&order_n=" +
              this.order_n +
              "&pay_amount=" +
              this.pay_amount +
              "&consumer_amount=" +
              this.data.consumer_amount
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
    let pages = getCurrentPages();
    if (!pages || pages.length <= 1) {
      // 跳转至店铺详情页
      wx.redirectTo({
        url: "/componentPages/payEntrance/payEntrance?number=" +
          app.globalData.store_n +
          "&consumptionGold=" +
          this.data.consumer_amount +
          "&xfjpopup=true",
      });
      return;
    }
    // 返回至店铺详情页
    let prevPage = pages[pages.length - 2];
    prevPage.setData({
      xfjpopup: true,
      zzc_hidden: false,
      consumptionGold: this.data.consumer_amount,
    });
    wx.navigateBack({
      delta: 1,
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