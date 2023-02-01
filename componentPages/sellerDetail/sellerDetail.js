import {
    request
} from "../../request/request"
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        number:"0099",
        sellerInfo:""
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getSellerInfo(options.number)
    },
    clickMobile (e){
        wx.makePhoneCall({
          phoneNumber: e.currentTarget.dataset.mobile
        }).catch((e) => {
            console.log(e)
        })
    },
    clickImg: function(e){
        wx.previewImage({
            urls: [e.currentTarget.dataset.envirnment], //需要预览的图片http链接列表，注意是数组
            current: '', // 当前显示图片的http链接，默认是第一个
        })
    },
    async getSellerInfo(number) {
        const res = await request({
            url: '/1/store/get',
            data: {
                number: number
            }
        })
        let {
            sellerInfo
        } = this.data
        sellerInfo = res.data.data
        this.setData({
            sellerInfo
        })
    }
})