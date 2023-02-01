import {
  getQrcodeMp
} from '../../utils/setting';
import {
  myLogin
} from "../../request/login";
const app = getApp()
Page({
  data: {

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("scan qrcode: ", options)
    // 扫码进入清楚缓存
    wx.clearStorageSync();
    let url = decodeURIComponent(options.q);
    let paramer = url.split("?no=");
    let qrcode_no = paramer[1]; //后续还原这个
	// dev地址的二维码code: 直接买单先消费：QR20220725134849ZGKJ  
	// api正式地址的的二维码code: 直接买单先消费：QR20220907181257NXGV
	// iclod测试地址的二维码code: 直接买单先买单 QR20220729102850YKIR  先消费：QR20220822081633TY5H
    // let qrcode_no = "QR20220729102850YKIR";//先买单：正式地址 桌台号A0001：QR202206201746098YUC   桌台号A003：QR202207051359152AEP
    // let qrcode_no = "QR202207291029087L7C";//先买单：测试地址 桌台B003：QR202207291029087L7C   桌台B002：QR202207291029087LFZ
    //二维码关联编号
    this._getQrcodeMpUrl(qrcode_no);
  },
  scan(){
	  wx.scanCode({
	    success: (res) => {
	      console.log(res);
	    },
	  });
  },
  //获取二维码跳转地址信息
  _getQrcodeMpUrl(qrcode_url_mapping_n) {
    if (!qrcode_url_mapping_n) {
      wx.showToast({
        title: '二维码信息异常，请联系管理员',
        icon: 'none'
      })
      return
    }
    getQrcodeMp(qrcode_url_mapping_n).then(data => {
      if (!data.target_type) {
        wx.showModal({
          title: '二维码信息异常',
          content: '请联系店员',
          showCancel: 'false',
          success: function (res) {
            wx.switchTab({
              url: '/pages/home/home',
            })
          },
        })
        return
      }
      let targetParam = JSON.parse(data.target_param)
      let storeN = targetParam.store_n;
      let seats_n = targetParam.seats_n
      app.globalData.store_n = storeN
      wx.login({
        success: (res) => {
          // 微信获取登录的code信息只能使用一次
          let param = {
            code: res.code,
            store_n: storeN,
          };
          myLogin(param).then((res) => {
            wx.setStorageSync("access_token", res.access_token);
            wx.redirectTo({
              url: '/pages/choose/people/index?seatsN=' + seats_n
            })
          });
        },
      });

    }).catch(e => {
      console.log(e);
    });
  },
})