import {
    API_ROOT
} from "./network"
export const request = (params) => {
    return new Promise((resolv, reject) => {
        
        let token = wx.getStorageSync('access_token')
        params.data.access_token=token
        wx.request({
            ...params,
            url: API_ROOT + params.url,
            data: params.data||{},
            method:"POST",
            header: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            success: (result) => {
                resolv(result)
            },
            fail: (res) => {
                reject(res)
            },
        })
    })
}