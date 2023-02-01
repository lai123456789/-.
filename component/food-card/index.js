// component/food-card/index.js
Component({
  options: {
    addGlobalClass: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    food: Object,
    withdrawalSetting: Object
  },

  /**
   * 组件的初始数据
   */
  data: {
    color: getApp().globalData.color
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _clickFood: function (e) {
      this.triggerEvent("_clickFood");
    },
  }
})
