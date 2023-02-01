// component/Tabs/Tabs.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        Tabs: {
            type: Array,
            value: []
        },
		attribute: {
			type: Object,
			value: {}
		}
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
        ItemTap: function (e) {
            const {
                index
            } = e.currentTarget.dataset
            this.triggerEvent('TabsChange', {
                index
            })
        }
    }
})