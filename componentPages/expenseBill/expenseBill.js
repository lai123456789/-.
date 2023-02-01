import { formatTime } from "../../utils/util";
import { getGoldFlow, getGoldFlowCount } from "../../request/getData";
Page({
  /**
   * 页面的初始数据
   */
  current_page: 0,
  TotalPage: 1,
  type: "",
  data: {
    Tabs: [
      {
        id: 0,
        name: "入账",
        isActive: true,
      },
      {
        id: 1,
        name: "消费",
        isActive: false,
      },
    ],
	attribute: {
		width: '100rpx',
		borderBottmIs: true,
		borderColor: '#FE2544'
	},
    maxDate: new Date().getTime(),
    currentDate: formatTime(new Date(), "month"),
    orderMonth: formatTime(new Date(), "month").replace(/\-/g, ""), //请求参数月
    expenseBillData: [],
    amount_sum: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._getGoldFlow();
    this._getGoldFlowCount();
  },
  _getGoldFlowCount() {
    let parma = {
      type: this.type,
      month: this.data.orderMonth,
      current_page: this.current_page,
    };
    getGoldFlowCount(parma).then((res) => {
      this.setData({
        amount_sum: res.amount_sum,
      });
    });
  },
  _getGoldFlow() {
    this.type = this.data.Tabs[0].isActive ? "INCOME" : "EXPEND";
    this.current_page++;
    let parma = {
      type: this.type,
      month: this.data.orderMonth,
      current_page: this.current_page,
    };
    getGoldFlow(parma).then((res) => {
      this.setData({
        expenseBillData: res.records,
      });
    });
  },
  handleTabsChange(e) {
    const { index } = e.detail;
    const { Tabs } = this.data;
    Tabs.forEach((v, i) =>
      i === index ? (v.isActive = true) : (v.isActive = false)
    );
    if (index == 1) {
      this.reset();
      this._getGoldFlow();
      this._getGoldFlowCount();
    } else {
      this.reset();
      this._getGoldFlow();
      this._getGoldFlowCount();
    }
    this.setData({
      Tabs,
    });
  },
  onConfirm(e) {
    let data = e.detail.value;
    let requestData = data.replace(/\-/g, "");
    this.setData({
      currentDate: data,
      orderMonth: requestData,
    });
    this.reset();
    this._getGoldFlow();
    this._getGoldFlowCount();
  },
  reset() {
    this.current_page = 0;
    this.TotalPage = 1;
    this.setData({ expenseBillData: [] });
  },
});
