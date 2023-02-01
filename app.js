// app.js
App({
  globalData: {
    userInfo: null,
    store_n: "", // 店铺编码
    longitude: "",
    latitude: "",
    storeLogo: "",
  },
  onLaunch(e) {
    let _this = this;
    //获取店铺编码
    _this.globalData.store_n = e.query.store_n;
    // 检查更新
    _this.autoUpdate();
    // 获取定位
    // _this._getLocatin();

    // 重写分享
    // this.overShare()
    // this.connectSocket()
    const {
      windowWidth,
      windowHeight,
      statusBarHeight,
      platform,
    } = wx.getSystemInfoSync();
    let mineHeight = windowHeight * (750 / windowWidth);
    _this.globalData.mineHeight = mineHeight;
    const {
      top,
      height,
	  width
    } = wx.getMenuButtonBoundingClientRect();
    // 状态栏高度
    wx.setStorageSync("statusBarHeight", statusBarHeight);
    // 胶囊按钮高度 一般是32 如果获取不到就使用32
    wx.setStorageSync("menuButtonHeight", height ? height : 32);
	// 胶囊按钮宽度 一般是87 如果获取不到就使用87
    wx.setStorageSync("menuButtonWidth", width ? width : 87);

    // 判断胶囊按钮信息是否成功获取
    if (top && top !== 0 && height && height !== 0) {
      const navigationBarHeight = (top - statusBarHeight) * 2 + height;
      // 导航栏高度
      wx.setStorageSync("navigationBarHeight", navigationBarHeight);
    } else {
      wx.setStorageSync(
        "navigationBarHeight",
        platform === "android" ? 48 : 40
      );
    }
    wx.getSystemInfo({
      success: (res) => {
        if (res.safeArea.top > 20) {
          _this.globalData.needAdapt = true;
        }
      },
    });
  },
  autoUpdate: function () {
    //使用更新对象之前判断是否可用
    if (wx.canIUse("getUpdateManager")) {
      const updateManager = wx.getUpdateManager();
      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        //res.hasUpdate返回boolean类型
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: "更新提示",
              content: "新版本已经准备好，是否重启当前应用？",
              success(res) {
                if (res.confirm) {
                  // 新的版本已经下载好，调用applyUpdate应用新版本并重启
                  updateManager.applyUpdate();
                }
              },
            });
          });
          // 新版本下载失败时执行
          updateManager.onUpdateFailed(function () {
            wx.showModal({
              title: "发现新版本",
              content: "请删除当前小程序，重新搜索打开...",
            });
          });
        }
      });
    } else {
      //如果小程序需要在最新的微信版本体验，如下提示
      wx.showModal({
        title: "更新提示",
        content: "当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。",
      });
    }
  },
  overShare: function () {
    let that = this;
    //监听路由切换
    //间接实现全局设置分享内容
    wx.onAppRoute(function (res) {
      //获取加载的页面
      let pages = getCurrentPages(),
        //获取当前页面的对象
        view = pages[pages.length - 1],
        data;
      if (view) {
        data = view.data;
        console.log("是否重写分享方法", data.isOverShare);
        if (!data.isOverShare) {
          data.isOverShare = true;
          view.onShareAppMessage = function () {
            // 你的分享配置
            return {
              title: that.globalData.storeInfo.store_name,
              path: "/pages/home/home",
            };
          };
        }
      }
    });
  },
  watch: function (ctx, obj) {
    Object.keys(obj).forEach(key => {
      this.observer(ctx.data, key, ctx.data[key], function (value) {
        obj[key].call(ctx, value)
      })
    })
  },
  // 监听属性，并执行监听函数
  observer: function (data, key, val, fn) {
    Object.defineProperty(data, key, {
      configurable: true,
      enumerable: true,
      get: function () {
        return val
      },
      set: function (newVal) {
        if (newVal === val) return
        fn && fn(newVal)
        val = newVal
      },
    })
  },
  //
  // _getLocatin() {
  //   let _this = this;
  //   wx.getLocation({
  //     success: (res) => {
  //       _this.globalData.longitude = res.longitude;
  //       _this.globalData.latitude = res.latitude;
  //     },
  //   });
  // },
});