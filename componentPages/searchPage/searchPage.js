import { getStoreNearby, getCatesList } from "../../request/getData";
Page({
  /**
   * 页面的初始数据
   */
  leftArr: [],
  rightArr: [],
  // 请求参数
  couponType: "",//优惠活动
  perCostStart: "", //人均消费-开始
  perCostEnd: "", //人均消费-结束
  storeType: "", //分类级别：FIRST, SECOND, THREE
  storeTypeN: "", //分类编号
  distance: "", //距离：纯数字，单位 m
  currentPage: 0,
  longitude: 0, //经度
  latitude: 0, //纬度
  storePageSort: "DESC", //排序规则：ASC(升序), DESC（降序）
  storePageSortValue: "TIME", //排序属性：DISTANCE（距离） PRICE（金额）SALES（销量） TIME(最新上架)
  handNavbar: false, // 筛选框触发
  // authLocation: false,
  inputValue: "",
  data: {
    leftArr: [],
    rightArr: [],
    middleGap: "20rpx",
    history: [],
    keywords: "",
    isSearch: false,
    isFixedTop: false,
    // 吸顶高度
    fixedHeight:
      wx.getStorageSync("statusBarHeight") +
      wx.getStorageSync("navigationBarHeight") +
      40 +
      "px",
    //导航栏高度
    navigationBarAndStatusBarHeight:
      wx.getStorageSync("statusBarHeight") +
      wx.getStorageSync("navigationBarHeight"),
    navbarInitTop: 0,
    isFixedTop: false,
    snfixed: false,
    zzc_hidden: true,
    //筛选框数据
    selectionList: [
      {
        selectIndex: "0",
        name: "附近",
        isActive: false,
      },
      // {
      //   selectIndex: "1",
      //   name: "美食",
      //   isActive: false,
      // },
      {
        selectIndex: "2",
        name: "智能排序",
        isActive: false,
      },
      {
        selectIndex: "3",
        name: "筛选",
        isActive: false,
      },
    ],
    topSearch: ["秒杀", "烧烤", "海底捞", "蜜雪冰城", "粥老大砂锅粥·烧烤·小炒"],
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      history: wx.getStorageSync("searchHistory"),
    });
  },
  onShow: function () {
    let that = this;
    if (that.data.navbarInitTop == 0) {
      //获取节点距离顶部的距离
      wx.createSelectorQuery()
        .select("#navbar")
        .boundingClientRect(function (rect) {
          if (rect && rect.top > 0) {
            let navbarInitTop = Math.ceil(
              rect.top - that.data.navigationBarAndStatusBarHeight + 1
            );
            that.setData({
              navbarInitTop: navbarInitTop,
            });
          }
        })
        .exec();
    }
  },
  onReachBottom(e) {
    // if (!this.authLocation) {
    //   return;
    // }
    this.addPageInfo();
  },
  onPageScroll(e) {
    if (!this.data.zzc_hidden && !this.handNavbar) {
      this.closeDropdown();
    }
    // 筛选框吸顶
    if (e.scrollTop >= this.data.navbarInitTop && !this.data.isFixedTop) {
      this.setData({
        isFixedTop: true,
      });
    } else if (e.scrollTop < this.data.navbarInitTop && this.data.isFixedTop) {
      this.setData({
        isFixedTop: false,
      });
    }
    if (this.handNavbar) {
      this.handNavbar = false;
    }
  },
  minput(e) {
    if (!e.detail.value) {
      this.setData({
        isSearch: false,
      });
    }
    this.setData({
      keywords: e.detail.value,
    });
  },
  confirm(e) {
    if (!this.data.keywords) {
      wx.showToast({
        title: "请输入搜索内容",
        icon: "none",
      });
      return;
    }
    this.reset();
    this._getStoreNearby();
    this.setHistory();
    this.setData({
      isSearch: true,
    });
  },
  setKey(e) {
    this.setData({
      keywords: e.currentTarget.dataset.value,
    });
    this.confirm();
  },
  clearKey() {
    this.setData({
      isSearch: false,
      keywords: "",
    });
  },
  showMaskLayer(e) {
    this.setData({
      zzc_hidden: !e.detail,
    });
  },
  // 附近筛选框
  _getDistance(e) {
    this.reset();
    this.distance = e.detail;
    this.selectComponent("#waterfallFlow").resetListData();
    this.storePageSortValue = "DISTANCE";
    this.longitude = wx.getStorageSync("longitude"); //经度
    this.latitude = wx.getStorageSync("latitude"); //纬度
    this._getStoreNearby();
    this.setData({
      zzc_hidden: true,
    });
  },
  //美食筛选框
  _getFoodData(e) {
    this.reset();
    this.storeType = e.detail.storeType;
    this.storeTypeN = e.detail.number;
    this.selectComponent("#waterfallFlow").resetListData();
    this.selectComponent("#my_dropdown").onClose();
    this._getStoreNearby();
    this.setData({
      zzc_hidden: true,
    });
  },
  //智能排序筛选框
  _getsortdata(e) {
    this.reset();
    this.storePageSortValue = e.detail.value;
    this.storePageSort = e.detail.sort;
    this.selectComponent("#waterfallFlow").resetListData();
    this.selectComponent("#my_dropdown").onClose();
    if (this.storePageSortValue == "DISTANCE") {
      this.longitude = wx.getStorageSync("longitude"); //经度
      this.latitude = wx.getStorageSync("latitude"); //纬度
    }
    this._getStoreNearby();
    this.setData({
      zzc_hidden: true,
    });
  },
  // 附近筛选框
  _getPerCost(e) {
    this.reset();
    this.couponType = e.detail.couponType;
    this.perCostStart = e.detail.perCostStart;
    this.perCostEnd = e.detail.perCostEnd;
    this.selectComponent("#waterfallFlow").resetListData();
    this._getStoreNearby();
    this.setData({
      zzc_hidden: true,
    });
  },
  closeDropdown() {
    this.selectComponent("#my_dropdown").onClose("clear");
    this.setData({
      zzc_hidden: true,
    });
  },
  _getStoreNearby() {
    if (this.currentPage >= this.totalPage) {
      return;
    }
    this.currentPage++;
    let param = {
      keywords: this.data.keywords,
	  couponType: this.couponType,
      perCostStart: this.perCostStart,
      perCostEnd: this.perCostEnd,
      storeType: this.storeType,
      storeTypeN: this.storeTypeN,
      distance: this.distance,
      currentPage: this.currentPage,
      longitude: this.longitude,
      latitude: this.latitude,
      storePageSort: this.storePageSort,
      storePageSortValue: this.storePageSortValue,
    };
    getStoreNearby(param).then((res) => {
      this.totalPage = res.page_count;
      let leftArr = this.leftArr,
        rightArr = this.rightArr,
        data = res.records;
      if (data.length != 0) {
        data.forEach((ele, i) => {
          ele.distance = (ele.distance / 1000).toFixed(1);
          if (i == 0 || i % 2 == 0) {
            leftArr.push(ele);
          } else {
            rightArr.push(ele);
          }
        });
      }
      this.setData({
        leftArr,
        rightArr,
      });
    });
  },
  _getFoodCatesList() {
    const url = API_ROOT + "/1/store/type/all/defaulting";
    post(url).then((res) => {
      let foodList = [];
      foodList = res.sublevel;
      let foodItem = foodList[0].sublevel;
      this.setData({
        foodList,
        foodItem,
      });
    });
  },
  scrollTo(e) {
    if (e.currentTarget.offsetTop > 0) {
      // 点击筛选框
      this.handNavbar = true;
      wx.pageScrollTo({
        scrollTop:
          e.currentTarget.offsetTop - this.data.navigationBarAndStatusBarHeight,
        duration: 0,
      });
    }
  },
  reset() {
    this.leftArr = [];
    this.rightArr = [];
    this.storeType = [];
    this.storeTypeN = [];
	this.couponType = "";
    this.perCostStart = "";
    this.perCostEnd = "";
    this.storePageSort = "DESC";
    this.storePageSortValue = "TIME";
    this.currentPage = 0;
    this.totalPage = 1;
    this.longitude = 0;
    this.latitude = 0;
    this.setData({
      leftArr: [],
      rightArr: [],
    });
  },
  setHistory() {
    let h = wx.getStorageSync("searchHistory") || [];
    if (h.findIndex((v) => v == this.data.keywords) == -1 && h != []) {
      h.unshift(this.data.keywords);
      wx.setStorageSync("searchHistory", h);
    }
    this.setData({
      history: wx.getStorageSync("searchHistory"),
    });
  },
  clearHistory() {
    let that = this;
    wx.showModal({
      title: "确认清空搜索历史吗",
      success(res) {
        if (res.confirm == true) {
          that.setData({
            history: [],
          });
          wx.removeStorageSync("searchHistory");
        }
      },
    });
  },
  // 获取点击事件
  test(data) {
    let number = data.detail.number;
    wx.navigateTo({
      url: "/componentPages/payEntrance/payEntrance?number=" + number,
    });
  },
});
