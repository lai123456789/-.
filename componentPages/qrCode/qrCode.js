import { selectStoreNByQrNo } from "../../request/getData";
Page({
  /**
   * 页面的初始数据
   */
  data: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const url = decodeURIComponent(options.q);
    let paramer = url.split("?qr_no=");
    let qr_no = paramer[1];
    let param = {
      qrNo: qr_no,
    };
    // let param = {
    //   qrNo: options.qr_no,
    // };
    selectStoreNByQrNo(param)
      .then((res) => {
        wx.redirectTo({
          url: "/pages/pay/pay?store_n=" + res.storeN,
        });
      })
      .catch((err) => {
        wx.redirectTo({
            url: "/componentPages/qrCode404/qrCode404"
          });
        return;
      });
  },
});
