// component/yys-waterfallFlow/yys-waterfallFlow.js
Component({
  properties: {
    // 标准数据是否为总集合
    leftData: {
      type: Array,
    },
    rightData: {
      type: Array,
    },
    // 瀑布中间距 默认0
    middleGap: {
      type: String,
      value: "0",
    },
    longitude: { type: Number },
  },
  /**
   * 组件的初始数据
   */
  data: {
    leftList: [], // 左瀑布
    rightList: [], // 右瀑布
    waterfallGap: 40, // 标题高度
    // longitude: wx.getStorageSync("longitude"), //经度
    // latitude: wx.getStorageSync("latitude"), //纬度
  },
  /**
   * 监听数据
   */
  observers: {
    leftData(val) {
      this.setData({
        leftList: this.properties.leftData,
      });
    },
    rightData(val) {
      this.setData({
        rightList: this.properties.rightData,
      });
    },
  },
  methods: {
    /**
     * 方法--【点击元素】
     * @param {List} data => 点击元素
     */
    clickDom(data) {
      this.triggerEvent("clickDom", data.currentTarget.dataset.data);
    },
    resetListData() {
      this.setData({
        leftList: [],
        rightList: [],
      });
    },
  },
});
