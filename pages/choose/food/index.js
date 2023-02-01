// pages/store/foodChoices/choices/choices.js
import {
  get,
  post,
  API_ROOT
} from '../../../request/network';
import {
  getStoreInfo
} from '../../../request/getData';
import {
  menuConsoleRemark,
} from '../../../utils/menuConsole';

//菜单列表
const menuArrayUrl = API_ROOT + "/1/menu/catalog/array";
//菜单下菜品列表
const menuFoodArrayUrl = API_ROOT + "/1/menu/catalog/food/array";
//进入点餐控制台
const enterConsoleUrl = API_ROOT + "/1/menu/console/enter";
// 点餐详情
const menuConsoleInfoUrl = API_ROOT + "/1/menu/console/info";
//添加产品购物车
const addFoodToCartUrl = API_ROOT + "/1/package/cart/add";
//获取购物车中产品列表
const cartFoodArrayUrl = API_ROOT + "/1/package/cart/get/list";
// 操作购物车中的产品
const operatePackageCartUrl = API_ROOT + "/1/package/cart/operate";
//（消费后买单）提交菜单
const addFoodToConfirmedUrl = API_ROOT + "/1/package/confirmed/add";
//获取口袋信息
const packageInfoUrl = API_ROOT + "/1/package/info";
//控制台详情
const menuConsoleUrl = API_ROOT + "/1/menu/console/info";
//清空购物车
const clearCartUrl = API_ROOT + "/1/package/cart/clear";
// 空页面展示

const app = getApp()
// app.globalData.store_n = 'SN1659058867630'//'SN1655714681227'  //先写死 后面注释这行  icloud测试店铺 SN1659058867630

Page({

  /**
   * 页面的初始数据
   */
  data: {
	totalMinus: '',
    bannerList: [
      API_ROOT+"/1/accessory/redirect?accessory_no=XL20220617085831GWIZ",
      API_ROOT+"/1/accessory/redirect?accessory_no=XL20220617090722WIBN",
      API_ROOT+"/1/accessory/redirect?accessory_no=XL20220617090735ZNLN",
      API_ROOT+"/1/accessory/redirect?accessory_no=XL20220617090746JVAN",
      API_ROOT+"/1/accessory/redirect?accessory_no=XL20220617090754IEND",
    ],
    technicalY: 800,
    scrollHeight: 1800,
    storeInfo: {},
    color: app.globalData.color,
    consumerCount: 1,
    mpN: '',
    menuArray: [],
    curr_menu_n: '',
    menuProArray: [],

    showPsvPopup: false,
    // 当前菜品
    foodDetail: {},
    // 当前菜品的规格值列表
    productSpecValueArray: [],
    // 当前选择的菜品规格值
    currProductSpecValue: {},
    foodCartShow: false,
	youhuiShow: false,
    // 灰口袋统计数据
    packageData: {
      cart_food_count: 0,
      selling_price: '0.00',
      total_price: '0.00'
    },
    // 控制台编号
    menuConsoleN: '',
    // 添加菜品数量
    foodCount: 1,
    // 购物车菜品
    cartFoodArray: [],
    menuConsole: {},
    consoleType: '',
    tabViewTop: 400,
    tabStickyFixed: false,
    foodHeightArr: [],
    toView: '',
    storeSetting: {},
    activityType: 'LOGIN',
    // 登陆活动弹窗
    registPopupShow: false,
    // 登陆活动信息
    registActivityArray: [],
    couponData: {},
    vipcardDataArray: [],
    consumerDialogShow: false,
    consumerRemark: '',
    // 会员卡设置信息
    withdrawalSetting: {},
    // Banner信息
    storeAdvertising: {}
  },
  lookInfo(){
	  this.setData({
	    youhuiShow: !this.data.youhuiShow
	  })
  },
  setScrollHeight: function () {
    let that = this
    let width = wx.getSystemInfoSync().windowWidth
    let height = wx.getSystemInfoSync().windowHeight
    let windowHeight = (height * (750 / width))
    const query = wx.createSelectorQuery()
    query.select('#last-view').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {
      let technicalY = (res[0].top * (750 / width))
      let scrollHeight = windowHeight - 100
      that.setData({
        technicalY: technicalY + 80,
        scrollHeight: scrollHeight
      })
    })
  },
  _clickMine: function () {
    wx.navigateTo({
      url: '../../mine/index',
    })
  },
  _clickHeadStore: function () {
    let pages = getCurrentPages()
    if (pages.length == 1) {
      wx.navigateTo({
        url: '../../store/index',
      })
      return
    }
    wx.navigateBack()
  },
  _clickService: function () {
    wx.makePhoneCall({
      phoneNumber: this.data.storeInfo.mobile
    })
  },

  _storeAdvertisingGet: function () {
    let that = this
    storeAdvertisingGet().then(data => {
      that.setData({
        storeAdvertising: data
      })
    })
  },

  _clickFreeCoupon: function () {
    wx.navigateTo({
      url: '../../ticket/index?type=FREEDOM'
    })
  },

  _clickAgencyCoupon: function () {
    wx.navigateTo({
      url: '../../ticket/index?type=AGENCY'
    })
  },

  _clickVipcard: function () {
    wx.navigateTo({
      url: '../../personal/membership/membership?show=true',
    })
  },
  onClickClearCar: function () {
	let that = this
	wx.showModal({
	  title: "确认清空吗？",
	  success(res) {
	    if (res.confirm) {
	      let param = {
	        menu_console_n: that.getMenuConsoleN()
	      }
	      get(clearCartUrl, param).then(data => {
	        that.packageFun()
	      })
	    }
	  },
	})
  },

  init: function () {
    this.getStoreInfoFun();
    // 获取菜单菜品
    this.menuFoodArrayFun()
    // 菜单列表
    this.menuArrayFun();
  },


  getStoreInfoFun: function () {
    var that = this
    var param = {
      number: app.globalData.store_n
    }
    getStoreInfo(param).then(data => {
      that.setData({
        storeInfo: data
      })
    })
  },

  // 点击添加菜品数量按钮
  clickFoodCountIncrease: function (e) {
    let storeStatus = app.globalData.storeStatus
    if (storeStatus == 'OFF') {
      wx.showToast({
        title: app.globalData.hint,
        icon: 'none'
      })
      return
    }
    if (this.data.foodCount >= 99) {
      wx.showToast({
        title: '不能再多了',
        icon: 'none'
      })
      return
    }
    this.setData({
      foodCount: this.data.foodCount + 1
    })
  },

  // 点击减去菜品数量按钮
  clickFoodCountReduce: function (e) {

    if (this.data.foodCount <= 1) {
      return
    }
    this.setData({
      foodCount: this.data.foodCount - 1
    })
  },

  getFoodCount: function () {
    return this.data.foodCount
  },

  //进入点餐控制台
  enterConsoleFun: function () {
    var that = this
    var param = {
      store_n: app.globalData.store_n,
      mp_n: this.data.mpN,
      type: this.data.consoleType,
      consumer_count: this.data.consumerCount
    }
    get(enterConsoleUrl, param).then(data => {
      that.setData({
        menuConsole: data,
        menuConsoleN: data.menu_console_n
      })
      that.packageFun()
    }).catch(e => {
      console.log(e);
    });
  },

  _menuConsoleInfo() {
    var that = this
    var param = {
      console_n: this.data.menuConsoleN
    }
    get(menuConsoleInfoUrl, param).then(data => {
      that.setData({
        menuConsole: data
      })
      that.packageFun()
    })
  },

  getCurrProductSpecValueN: function () {

    return this.data.currProductSpecValue.product_spec_value_n
  },

  // 装入口袋
  addFoodToCartFun: function () {
    let storeStatus = app.globalData.storeStatus
    if (storeStatus == 'OFF') {
      wx.showToast({
        title: app.globalData.hint,
        icon: 'none'
      })
      return
    }
    if (!this.getMenuConsoleN()) {
      wx.showToast({
        title: '点餐台状态异常',
        icon: 'none'
      })
      return
    }
    var psvnArr = [{
      product_spec_value_n: this.getCurrProductSpecValueN()
    }]
    var param = {
      "menu_console_n": this.getMenuConsoleN(),
      "menu_catalog_n": this.data.foodDetail.menu_catalog_n,
      "food_n": this.getCurrFoodN(),
      "product_spec_value_n_array": JSON.stringify(psvnArr),
      "food_count": this.getFoodCount()
    };
    post(addFoodToCartUrl, param).then(data => {
      this.onClosePsvPopup()
      this.packageFun();
    }).catch(e => {
      console.log(e);
    });
  },

  // 获取控制台编号
  getMenuConsoleN: function () {
    return this.data.menuConsoleN
  },

  // 隐藏灰口袋弹窗
  closefoodCartShow: function () {

    this.setData({
      foodCartShow: false
    })
  },

  // 点击灰口袋
  clickPackage: function (e) {
    if (this.data.foodCartShow) {
      return
    }
    //显示弹窗
    this.setData({
      foodCartShow: true
    })
    // 刷新我的口袋
    this.packageFun();
  },

  _changeConsumerRemark: function (e) {
    this.setData({
      consumerRemark: e.detail
    })
  },

  _clickClose: function () {
    this.setData({
      foodCartShow: false,
      consumerDialogShow: false,
      consumerRemark: ''
    })
  },

  _navigateToReceipt() {
    wx.navigateTo({
      url: '../../receipt/index?menuConsoleN=' + this.getMenuConsoleN() + "&orderClassify=CONSUMER",
    })
  },

  //操作减
  onClickReduce: function (e) {
    var that = this
    var index = e.detail.index;
    var cartFoodArray = this.data.cartFoodArray;
    //数量
    var foodCount = cartFoodArray[index].food_count - 1;
    //更新云端
    var param = {
      cart_food_n: cartFoodArray[index].card_food_n,
      type: 'SUB'
    };
    post(operatePackageCartUrl, param).then(data => {
      that.packageFun()
    }).catch(e => {
      console.log(e);
    });
  },
  // 加菜操作
  onClickIncrease: function (e) {
    var index = e.detail.index;
    var cartFoodArray = this.data.cartFoodArray;
    //数量
    var foodCount = cartFoodArray[index].food_count;
    foodCount += 1;
    var param = {
      cart_food_n: cartFoodArray[index].card_food_n,
      type: 'ADD'
    };
    //更新云端
    post(operatePackageCartUrl, param).then(data => {
      if (parseInt(data.food_count) > 0) {
        var cart_food_count = "cartFoodArray[" + index + "].food_count";
        var amount = "cartFoodArray[" + index + "].amount";
        var amount_desc = "cartFoodArray[" + index + "].amount_desc";
        var selling_amount = "cartFoodArray[" + index + "].selling_amount";
        var total_amount = "cartFoodArray[" + index + "].total_amount";
        this.setData({
          [cart_food_count]: data.food_count,
          [amount]: data.amount,
          [amount_desc]: data.amount_desc,
          [selling_amount]: data.selling_amount,
          [total_amount]: data.total_amount
        });
      }
      this.packageFun()
    }).catch(e => {
      console.log(e);
    });
  },

  // 获取灰口袋统计信息
  packageFun: function () {
    if (!this.getMenuConsoleN()) {
      wx.showToast({
        title: '点餐台状态异常',
        icon: 'none'
      })
      return
    }
    var url = packageInfoUrl + "?menu_console_n=" + this.getMenuConsoleN();
    get(url).then(data => {
      this.setData({
        packageData: data,
		totalMinus: Number(data.consumer_price) + Number(data.amount_discount),
        cartFoodArray: data.cart_food
      })
    }).catch(e => {
      console.log(e);
    });
  },

  // 获取菜单下的菜品
  menuFoodArrayFun: function () {
    var that = this
    var param = {
      store_n: app.globalData.store_n
    }
    get(menuFoodArrayUrl, param).then(data => {
      that.setData({
        menuProArray: data,
      })
      that._foodHeightArray()
    }).catch(e => {
      console.log(e);
    });
  },

  _foodHeightArray: function () {
    let that = this
    let heightArr = []
    let height = 0
    const query = wx.createSelectorQuery();
    query.selectAll('.view-tab-food-choices').boundingClientRect(function (n) {
      n.forEach((res) => {
        height += res.height;
        heightArr.push(height)
      });
      that.setData({
        foodHeightArr: heightArr
      })
    }).exec()
  },

  // 选择菜单
  onClickMenuSelect: function (e) {
    let curr_menu_n = e.currentTarget.dataset.id
    this.setData({
      curr_menu_n: curr_menu_n,
      toView: 'inToView' + curr_menu_n
    })
  },

  _onScroll(e) {
    let curr_menu_n = this.data.curr_menu_n
    let scrollTop = e.detail.scrollTop;
    let scrollArr = this.data.foodHeightArr;
    let flag = false
    if (scrollTop >= scrollArr[scrollArr.length - 1] - this.data.scrollHeight) {
      return
    }

    for (let i = 0; i < scrollArr.length; i++) {
      let toMenuView = ''
      if (scrollTop >= 0 && scrollTop < scrollArr[0]) {
        if (curr_menu_n != this.data.menuArray[0].menu_catalog_n) {
          flag = true
          curr_menu_n = this.data.menuArray[0].menu_catalog_n
          toMenuView = "inToMenuView_" + curr_menu_n
        }
      } else if (scrollTop >= scrollArr[i - 1] && scrollTop < scrollArr[i]) {
        if (curr_menu_n != this.data.menuArray[i].menu_catalog_n) {
          flag = true
          curr_menu_n = this.data.menuArray[i].menu_catalog_n
          toMenuView = "inToMenuView_" + curr_menu_n
        }
      }
      if (flag) {
        this.setData({
          curr_menu_n: curr_menu_n,
          toMenuView: toMenuView
        })
      }
    }
  },

  // 获取当前菜品编号
  getCurrFoodN: function () {

    return this.data.foodDetail.food_n
  },

  // 菜品选择
  onClickFoodSelect: function (e) {
    var currentPro = e.currentTarget.dataset.item
    this.setData({
      foodCount: 1,
      showPsvPopup: true,
      foodDetail: currentPro,
      //所有规格
      productSpecValueArray: currentPro.product_spec_value_array,
      currProductSpecValue: currentPro.product_spec_value_array[0],
    })
  },

  // 菜单提交操作
  onClickSubmitMenu: function () {
    if (this.data.storeInfo.businesStatus == 'OFF') {
      wx.showToast({
        title: "店铺已打烊，敬请见谅！",
        icon: 'none'
      })
      return
    }
    var that = this;
    if (this.data.cartFoodArray.length <= 0) {
      wx.showToast({
        title: '请添加菜品到购物车',
        icon: 'none',
      });
      return;
    }
	if (this.data.menuConsole.type == 'CONSUMER') {
	  this.setData({
	    consumerDialogShow: true
	  })
	} else {
		//先买单
	  this._menuConsoleRemark()
	}
    // this.setData({
    //   consumerDialogShow: true
    // })
  },
  // 点击备注弹窗确定按钮
  _clickConfirm: function () {
    if (this.data.menuConsole.type == 'CONSUMER') { //先消费
      this._submitConsumer()
      return;
    }
	// 先买单
    this._menuConsoleRemark()
  },
  //  先消费提交购物车
  _submitConsumer: function () {
    var that = this
    var param = {
      "menu_console_n": this.getMenuConsoleN(),
      remark: this.data.consumerRemark
    };
    post(addFoodToConfirmedUrl, param).then(data => {
      that._clickClose()
      wx.showToast({
        title: '提交成功，等待接受',
        icon: 'none'
      })
      that.packageFun();
      wx.navigateTo({
        url: '../receipt/index?menuConsoleN=' + this.getMenuConsoleN() + "&orderClassify=CONSUMER",
      })
    })
  },
  // 修改控制台编号
  _menuConsoleRemark: function () {
    let consoleN = this.getMenuConsoleN()
    let remark = this.data.consumerRemark
    if (!remark) {
      this._clickClose()
      this._navigateToPrepaid()
      return
    }
    let that = this
    menuConsoleRemark(consoleN, remark).then(data => {
      that._clickClose()
      that._navigateToPrepaid()
    })
  },

  // 提交操作
  onClickSubmitMenuOnConsumer: function () {
    if (this.data.menuConsole.type == 'CONSUMER') {
      this.setData({
        consumerDialogShow: true
      })
    } else {
      this._navigateToPrepaid()
    }
  },
  // 


  //加载控制台详情
  menuConsoleFun: function () {
    var that = this
    var url = menuConsoleUrl + "?menu_console_n=" + this.getMenuConsoleN();
    get(url).then(data => {
      that.setData({
        menuConsole: data
      });
      that.settlement();
    }).catch(e => {
      console.log(e);
    });
  },

  // 我要结算
  settlement: function () {
    var length = this.data.cartFoodArray.length;
    if (length <= 0) {
      wx.showToast({
        title: '无可结算的菜单',
        icon: 'none',
      });
      return;
    }
    var that = this;
    var menuConsoleStatus = this.data.menuConsole.status;
    var awaitCount = this.data.acceptCountInfo.await_countl;
    var flag = true
    if (awaitCount > 0) {
      wx.showModal({
        title: '有待接受的菜单，确认结算?',
        content: '待接受的菜单,结算后将自动取消',
        success: function (res) {
          if (!res.cancel) {

            return
          }
        },
      });
    } else if (menuConsoleStatus == 'LOCKED') {
      wx.showModal({
        title: '已提交结算申请，是否继续结算?',
        content: '继续结算，完成付款',
        success: function (res) {
          if (!res.cancel) {

            return
          }
        },
      });
    } else {

    }
  },

  _navigateToPrepaid() {
    // wx.navigateTo({
    //   url: '../prepaid/index?consoleN=' + this.getMenuConsoleN() + "&orderType=CONSUMER" //原跳转页面
    // });
	wx.navigateTo({
	  url: '/pages/choose/orderTablePay/orderTablePay?consoleN=' + this.getMenuConsoleN() + "&orderType=CONSUMER"  //新增跳转这个页面
	})
  },

  // 规格值选择
  onClickSpecValueSelect: function (e) {

    var index = e.currentTarget.dataset.index;
    this.setData({
      foodCount: 1,
      currProductSpecValue: this.data.productSpecValueArray[index]
    })
  },

  // 隐藏菜品详情弹窗
  onClosePsvPopup: function (e) {
    this.setData({
      showPsvPopup: false
    })
  },

  // 获取当前菜单编号
  getCurrMenuN: function () {

    return this.data.curr_menu_n
  },

  //菜单查询
  menuArrayFun: function () {
    var param = {
      store_n: app.globalData.store_n
    }
    get(menuArrayUrl, param).then(data => {
      this.setData({
        menuArray: data,
        curr_menu_n: data[0].menu_catalog_n
      })
    })
  },

  _tabStickyScroll: function (e) {
    var fixed = e.detail.isFixed
    this.setData({
      tabStickyFixed: fixed
    })
  },

  _clickEvaluation: function () {
    wx.navigateTo({
      url: '../../evaluation/list/index?type=STORE',
    })
  },

  // 阻止蒙版层冒泡事件
  preventBubblingEvents: function (e) {

    return;
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setScrollHeight()
    if (options.consumerCount) {
      this.setData({
        consumerCount: options.consumerCount
      })
    }
    this.setData({
      consoleType: app.globalData.consoleType
    })
    if (options.mp_n) {
      this.setData({
        mpN: options.mp_n
      })
      this.enterConsoleFun()
    } else {
      this.setData({
        menuConsoleN: options.menuConsoleN
      })
      this._menuConsoleInfo()
    }
    this.init();
  },
  // 监听页面scroll滚动
  _pageScroll: function (e) {
    let scrollTop = e.detail.scrollTop;
    if (scrollTop >= this.data.tabViewTop) {
      if (!this.data.tabStickyFixed) {
        this.setData({
          tabStickyFixed: true
        })
      }
    } else {
      if (this.data.tabStickyFixed) {
        this.setData({
          tabStickyFixed: false
        })
      }
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let that = this
    const query = wx.createSelectorQuery()
    query.select('#tabId').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {
      that.setData({
        tabViewTop: res[0].top
      })
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})