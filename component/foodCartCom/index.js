// component/foodCartCom/foodCartCom.js

Component({
  options: {
    addGlobalClass: true
  },
  properties: {
    hPriceSwitch: Boolean,
    foodCartShow: Boolean,
    //购物车弹窗，已添加成功的产品
    cart_food_array: Array,
    //购物车弹窗，消费人数
    consumer_people_count:Number,
    //左右table标识
    selectIndex: Number
  },

  /**
   * 组件的初始数据
   */
  data: {
  },

  /**
   * 组件的方法列表
   */
  methods: {
    ready: function () {
      
    },

    onClickfoodCartShow: function (e) {
      this.triggerEvent("clickfoodCartShow");
    },
    //购物车减事件
    onClickReduce: function (e) {
      this.triggerEvent("onClickReduce", { "index": e.currentTarget.dataset.index});
    },
    //购物车加事件
    onClickIncrease: function (e) {
      this.triggerEvent("onClickIncrease", { "index": e.currentTarget.dataset.index });
    },
    onClickHeaderLeft: function (e) {
      this.triggerEvent("onClickHeaderLeft");
    },
	// 清空购物车
	onClickClearCar: function () {
	  this.triggerEvent("ClickClearCar");
	},

    // 阻止冒泡事件
    preventTouchMove: function (e) {


    }
  }
})
