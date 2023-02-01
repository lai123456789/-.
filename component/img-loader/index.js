// components/img-loader/index.js
Component({
  options: {
    addGlobalClass: true
  },
  externalClasses: ['custom-class'],
  /**
   * 组件的属性列表
   */
  properties: {
    mode: String,
    imgUrl: String,
    round: String
  },
  observers: {
    'mode': function (val) {
      if (val == null || !val) return;
      this.setData({
        modeVal: val
      })
    },
    'imgUrl': function (val) {
      let that = this
      if (val == null || !val) return;
      that.setData({
        showImage: true
      })
      // wx.getImageInfo({
      //   src: val,
      //   success(res) {
      //     that.setData({
      //       showImage: true
      //     })
      //   }
      // })
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    showImage: false,
    modeVal: 'aspectFill'
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})