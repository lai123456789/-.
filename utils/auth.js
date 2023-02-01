import {
    get,
    post,
    API_ROOT
} from './network';

/**
 * 授权登录
 * @param {*} code 
 * @param {*} storeN 
 * @param {*} inviterAccountN 
 */
export function authLogin(code, storeN) {
    if (!storeN) {
        wx.showToast({
            title: '店铺信息异常，请联系管理员',
            icon: 'none',
            duration: 1500
        })
        return
    }
    let param = {
        code: code,
        store_n: storeN
    }
    let url = API_ROOT + '/1/login/store';
    return new Promise(function (resolve, reject) {
        post(url, param).then(data => {
            // 保存店铺信息
            wx.setStorageSync("storeInfo", data)
            getApp().globalData.loginFlag = true
            getApp().globalData.refreshServe = true
            getApp().globalData.refreshMine = true
            getApp().globalData.storeInfo = data.store
            getApp().globalData.userInfo = data.user
            getApp().globalData.accountStatus = data.account_status
            getApp().globalData.storeStatus = data.store_status
            getApp().globalData.hint = data.hint
            getApp().globalData.businessStatus = data.business_status

            // 保存token缓存
            wx.setStorageSync("access_token", data.access_token)
            wx.setStorageSync("refresh_token", data.refresh_token)
            // promise机制放回成功数据
            resolve(data)
        })
    })
}
/**
 * 刷新token
 */
export function refreshToken(callBack) {
    const param = {
        refresh_token: wx.getStorageSync("refresh_token")
    }
    const url = API_ROOT + '/1/login/refresh/token';
    post(url, param).then(data => {
        // 保存token缓存
        wx.setStorageSync("access_token", data["access_token"])
        wx.setStorageSync("refresh_token", data["refresh_token"])
        callBack()
    }).catch(e => {
        // 登陆之前清除缓存
        wx.clearStorageSync();
        // 调用登录接口
        wx.login({
            success: function (res) {
                if (res.code) {
                    authLogin(res.code, getApp().globalData.storeN).then(data => {
                        getApp().globalData.toAuthPage = true
                        // 保存token缓存
                        wx.setStorageSync("access_token", data["access_token"])
                        wx.setStorageSync("refresh_token", data["refresh_token"])
                        callBack()
                    }).catch(e => {

                    })
                }
            }
        })
    })
}

/**
 * token是否有效
 */
// export function auth() {
//   var url = API_ROOT + '/1/auth';
//   return get(url);
// }

export function auth(callBack) {
    var url = API_ROOT + '/1/auth';
    get(url).then(data => {
        if (data === 'S00004') {
            refreshToken(function () {
                callBack()
            })
        } else {
            getApp().globalData.toAuthPage = true
            callBack()
        }
    })
}