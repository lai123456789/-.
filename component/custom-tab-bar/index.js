Component({
    data: {
        active: 0,
        icon: {
            normal: '/static/shoucang.png',
            active: '/static/sc_active.png'
        }
    },

    methods: {
        onChange(event) {
            this.setData({
                active: event.detail
            });
            // wx.switchTab({
            //     url: this.data.list[event.detail].url
            // });
        },
        theModelUpdtae() {
            wx.showToast({
              title: "功能升级中", //提示文字
              duration: 2000, //显示时长
              icon: "none", //图标，支持"success"、"loading"
            });
          },
        init() {
            const page = getCurrentPages().pop();
            this.setData({
                active: this.data.list.findIndex(item => item.url === `/${page.route}`)
            });
        }
    }
});