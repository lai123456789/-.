import {
  get,
  post,
  postNotLoading,
  put,
  del,
  API_ROOT,
} from "../../request/network";
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    fixedHeight: String,
    selectionList: Array,
    foodItem: Array,
    foodList: Array,
  },

  /**
   * 组件的初始数据
   */
  data: {
    selectionList: [],
    // 下拉选框选中索引
    currentIndex: "",
    //附近
    distanceIndex: "",
    show: false,
    near: "附近",
    distance: [
      {
        text: "附近",
        value: "",
      },
      {
        text: "500m",
        value: "500",
      },
      {
        text: "3km",
        value: "3000",
      },
      {
        text: "5km",
        value: "5000",
      },
      {
        text: "10km",
        value: "10000",
      },
    ],
    //分类
    showIndex: "",
    // 右边scroll-view 距离顶部的位置
    scrollTop: 0,
    foodIndex: 0,
    foodItemIndex: "",
    foodList: [],
    foodItem: [],
    //智能排序
    IntelligentIndex: "",
    IntelligentSortArr: [
      {
        value: "TIME",
        text: "智能排序",
        sort: "ASC",
      },
      {
        value: "DISTANCE",
        text: "距离优先",
        sort: "ASC",
      },
      {
        value: "SALES",
        text: "销量优先",
        sort: "DESC",
      },
      {
        value: "PRICE",
        text: "低价优先",
        sort: "ASC",
      },
      {
        value: "PRICE",
        text: "高价优先",
        sort: "DESC",
      },
    ],
    //筛选
    // 筛选价格标签
    priceTag: [
      {
        text: "20元以下",
        perCostStart: "",
        perCostEnd: "20",
        index: 0,
      },
      {
        text: "20-40元",
        perCostStart: "20",
        perCostEnd: "40",
        index: 1,
      },
      {
        text: "40-100元",
        perCostStart: "40",
        perCostEnd: "100",
        index: 2,
      },
      {
        text: "100元以上",
        perCostStart: "100.01",
        perCostEnd: "",
        index: 3,
      },
    ],
    priceIndex: "",
    perCostStart: "",
    perCostEnd: "",
  },
  /**
   * 生命周期--组件挂载前
   */

  attached() {
    let _this = this;
  },
  /**
   * 组件的方法列表
   */
  methods: {
    showPopup(e) {
      let { index } = e.currentTarget.dataset;
      let show = this.data.showIndex == index ? !this.data.show : true;
      // let showIndex = index == this.data.showIndex ? "" : index;
      let showIndex = index;
      this.triggerEvent("showmasklayer", show);
      this.setData({
        show,
        showIndex,
      });
      // }
    },
    getDistance(e) {
      let index = this.data.showIndex;
      let near = "selectionList[0].name";
      this.setData({
        [near]: e.currentTarget.dataset.text,
        show: false,
        distanceIndex: e.currentTarget.dataset.index,
        priceIndex: "",
        IntelligentIndex: "",
      });
      this.triggerEvent("getdistancechange", e.currentTarget.dataset.value);
    },
    foodItemTap(e) {
      let { index } = e.currentTarget.dataset;
      let foodItem = this.data.foodList[index].sublevel;
      this.setData({
        foodIndex: index,
        foodItem,
        priceIndex: "",
        scrollTop: 0,
      });
    },
    getFoodData(e) {
      let showIndex = this.data.showIndex;
      this.triggerEvent("getfooddata", e.currentTarget.dataset.data);
      let { index } = e.currentTarget.dataset;
      let near = "selectionList[" + showIndex + "].name";
      this.setData({
        [near]: e.currentTarget.dataset.data.name,
        foodItemIndex: index,
      });
    },
    getIntelligentSortData(e) {
      let showIndex;
      if (this.data.selectionList.length == 4) {
        //如果筛选框有美食分类
        showIndex = this.data.showIndex;
      } else {
        //  如果没有美食分类
        showIndex = 1;
      }
      let { index, data } = e.currentTarget.dataset;
      let near = "selectionList[" + showIndex + "].name";
      this.setData({
        [near]: data.text,
        show: false,
        IntelligentIndex: index,
        priceIndex: "",
        distanceIndex: "",
      });
      this.triggerEvent("getsortdata", e.currentTarget.dataset.data);
    },
    checkPriceTag(e) {
      let { perCostStart, perCostEnd, index } = e.currentTarget.dataset.data;
      this.setData({
        priceIndex: index,
        perCostStart: perCostStart,
        perCostEnd: perCostEnd,
      });
    },
    onClose(e) {
      e == "clear"
        ? this.setData({
            show: false,
            showIndex: "",
          })
        : this.setData({
            show: false,
          });
    },
    onReset() {
      this.setData({
        priceIndex: "",
        perCostStart: "",
        perCostEnd: "",
      });
    },
    getPerCost() {
      let data = {
        perCostStart: this.data.perCostStart,
        perCostEnd: this.data.perCostEnd,
      };
      this.setData({
        show: false,
      });
      this.triggerEvent("getpercost", data);
    },
  },
});
