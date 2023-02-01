import { request } from "../../request/request";
import { myMobile } from "../../request/login";
import { getUserInfo,getTradeInfo,modifyUserInfo } from "../../request/getData";

const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  pay_amount: "", // 实付金额
  consumer_amount: 0, // 获得消费金金额
  data: {
    nick_name: "",
    userMobile:"",
    logo: app.globalData.storeLogo,
    user: {
      userId: "",
    },
    money: "",
    zffs: "", //支付方式
    radioItem: [
      {
        value: "wx",
        name: "微信",
      },
    ],
    //付款按钮
    payment: false,
  },
  sessionKeyValid: false, 
  order_n: "",
  mobile: "",
  encryptedData: "",
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.pay_amount = options.pay_amount;
    let money = options.money;
    this.order_n = options.order_n;
    this.consumer_amount = options.consumer_amount;
    getUserInfo().then(res=>{
      let { userMobile } = this.data;
      userMobile = res.mobile;
      this.setData({
        nick_name: res.mobile,
        userMobile: res.mobile
      })
    });

    this.setData({
      logo: app.globalData.storeLogo,
      money: this.returnFloat(money),
    });
  },
  returnFloat(value) {
    var value = Math.round(parseFloat(value) * 100) / 100;
    var xsd = value.toString().split(".");
    if (xsd.length == 1) {
      value = value.toString() + ".00";
      return value;
    }
    if (xsd.length > 1) {
      if (xsd[1].length < 2) {
        value = value.toString() + "0";
      }
      return value;
    }
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
    if(this.sessionKeyValid) {
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
        if (_this.pay_amount == 0) {
          wx.showToast({
            title: "支付成功",
            icon: "none",
            duration: 1500,
          });
          this.setData({
            payment: false,
          });
          setTimeout(() => {
            wx.reLaunch({
              url:
                "/pages/gold/gold?number=" +
                app.globalData.store_n +
                "&consumptionGold=" +
                this.consumer_amount +
                "&xfjpopup=true",
            });
          }, 1500);
        } else {
          _this._getTradeInfo();
        }
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
  //写入用户信息
  _modifyUserInfo(nickName, avatarUrl) {
    let that = this;
    let param = {
      head_portrait: avatarUrl,
      nick_name: nickName,
    };
    modifyUserInfo(param).then((res) => {
      that._getTradeInfo();
    });
  },
  confirmedPay() {
    this.setData({
      payment: true
    })
    let that = this;
    if (!this.data.nick_name) {
      //无昵称获取用户信息更新平台用户信息
      wx.getUserProfile({
        desc: "desc",
        lang: "zh_CN",
        success: (s) => {
          const {
            nickName,
            avatarUrl
          } = s.userInfo;
          that.setData({
            nick_name: nickName || "匿名"
          })
          that._modifyUserInfo(nickName, avatarUrl);
        },
        complete: () => {
          this.setData({
            payment: false
          })
        }
      });
      return;
    }
    this._getTradeInfo()
  },
  paymoment(datas) {
    const {
      timeStamp,
      nonceStr,
      package_,
      signType,
      paySign
    } = {
      ...datas,
    };
    wx.requestPayment({
      timeStamp: timeStamp,
      nonceStr: nonceStr,
      package: package_,
      signType: signType,
      paySign: paySign,
      success: (res) => {
        wx.showToast({
          title: "支付成功",
          icon: "none",
          duration: 1500,
        });
        // 支付按钮开启
        this.setData({
          payment: false,
        });
        setTimeout(() => {
          wx.reLaunch({
            url: "/pages/gold/gold?number=" +
              app.globalData.store_n +
              "&consumptionGold=" +
              this.consumer_amount +
              "&xfjpopup=true",
          });
        }, 1500);
      },
      fail: (res) => {
        request({
          url: "/1/order/close",
          data: {
            order_n: this.order_n,
          },
        });
        wx.showToast({
          title: "支付失败,请重新付款",
          icon: "none",
          duration: 1500,
        });
        // 失败跳转支付页面重新发起付款
        wx.reLaunch({
          url: "/pages/pay/pay?store_n=" + app.globalData.store_n,
        });
      },
    });
  },
  _getTradeInfo() {
    this.setData({
      payment: true
    })
    let param = {
      order_n: this.order_n,
    };
    getTradeInfo(param).then((res) => {
      this.paymoment(res);
    }).catch(() => {
      this.setData({
        payment: false
      })
    })
  },
});