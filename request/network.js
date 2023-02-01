/**
 * Created by 23hp on 2018/3/30.
 * 基于Promise的网络请求库,包含GET POST请求，上传下载功能
 * 使用方法：
 * 先引入： import {get,post,...} from 本文件;
 * · get请求:    get("/index",{id:2}).then(data=>{}).catch(error=>{});
 * · post请求:    post("/index",{id:2}).then(data=>{}).catch(error=>{});
 * Promise详细介绍：
 * http://es6.ruanyifeng.com/#docs/promise
 */
/**
 * 访问跟域名
 */
// 联调环境域名
// export const API_ROOT = "https://dev.xiaolv6.com";
export const API_ROOT = "https://xiaolv-api.icloudxx.com";
// 线上环境域名
// export const API_ROOT = 'https://api.xiaolv6.com';

/**
 * 发起get请求
 * @param url 请求路径 必填
 * @param data 请求参数 get请求的参数会自动拼到地址后面
 * @param headers 请求头 选填
 * @returns {Promise}
 */
export const get = (url, data, headers) => request("GET", url, data, headers);
/**
 * 发起get不弹出加载框
 * @param url 请求路径 必填
 * @param data 请求参数 get请求的参数会自动拼到地址后面
 * @param headers 请求头 选填
 * @returns {Promise}
 */
export const getNotLoading = (url, data, headers) =>
	requestNotloading("GET", url, data, headers);

/**
 * 发起post请求
 * @param url 请求路径 必填
 * @param data 请求参数
 * @param headers 请求头 选填
 * @returns {Promise}
 */
export const post = (url, data, headers) => request("POST", url, data, headers);

/**
 * 发起post不弹加载框
 * @param url 请求路径 必填
 * @param data 请求参数
 * @param headers 请求头 选填
 * @returns {Promise}
 */
export const postNotLoading = (url, data, headers) =>
	requestNotloading("POST", url, data, headers);

/**
 * 发起put请求
 * @param url 请求路径 必填
 * @param data 请求参数
 * @param headers 请求头 选填
 * @returns {Promise}
 */
export const put = (url, data, headers) => request("PUT", url, data, headers);
/**
 * 发起delete请求
 * @param url 请求路径 必填
 * @param data 请求参数 delete请求的参数会自动拼到地址后面
 * @param headers 请求头 选填
 * @returns {Promise}
 */
export const del = (url, data, headers) =>
	request("DELETE", url, data, headers);

/**
 * 接口请求基类方法
 * @param method 请求方法 必填
 * @param url 请求路径 必填
 * @param data 请求参数
 * @param header 请求头 选填
 * @returns {Promise}
 */
export function request(
	method,
	url,
	data,
	header = {
		"Content-Type": "application/x-www-form-urlencoded",
	}
) {
	// if (!getApp().globalData.toAuthPage) {
	//   return;
	// }
	showFullScreenLoading();
	data = data || {};
	if (url.indexOf("/1/login/store/qrcode") == -1) {
		var accessToken = wx.getStorageSync("access_token");
		if (accessToken) {
			if (method.indexOf("POST") >= 0) {
				data["access_token"] = accessToken;
			} else if (method.indexOf(`GET`) >= 0) {
				if (url.indexOf("?") >= 0) {
					url = url + "&access_token=" + accessToken;
				} else {
					url = url + "?access_token=" + accessToken;
				}
			}
		}
	}
	return new Promise((resolve, reject) => {
		const response = {};
		wx.request({
			url,
			method,
			data,
			header,
			success: (res) => {
				if (

					res.data.result === "FAILED" &&
					res.data.data.error_code == "X011"
				) {
					wx.showToast({
						title: "权限不足，授权失败,请重新登录后进行操作",
						icon: "none",
					});
					setTimeout(() => {
						wx.reLaunch({
							url: "/pages/home/home",
						});
					}, 1500);
					return;
				}
				if (res.data.result === "SUCCESS") {
					console.log('res.data.datares.data.data', res.data.data)
					response.success = res.data.data;
				} else {
					setTimeout(() => {
						wx.showToast({
							title: res.data.data.error_code +
								"，" +
								res.data.data.error_msg +
								"，" +
								res.data.data.prompt_msg,
							icon: "none",
							duration: 2500,
						});
						response.fail = res.data.data;
					}, 1500)
				}
			},
			fail: (error) => {
				response.fail = error;
				setTimeout(() => {
					wx.showToast({
						title: "请求失败，网络异常",
						icon: "none",
						duration: 1500,
					});
				}, 70);
			},
			complete() {
				if (response.success) {
					resolve(response.success);
				} else {
					reject(response.fail);
				}
				tryHideFullScreenLoading(url);
				console.groupEnd();
			},
		});
	});
}

/**
 * 接口请求基类方法
 * @param method 请求方法 必填
 * @param url 请求路径 必填
 * @param data 请求参数
 * @param header 请求头 选填
 * @returns {Promise}
 */
export function requestNotloading(
	method,
	url,
	data,
	header = {
		"Content-Type": "application/x-www-form-urlencoded",
	}
) {
	data = data || {};
	if (url.indexOf("/1/login/store/qrcode") == -1) {
		var accessToken = wx.getStorageSync("access_token");
		if (accessToken) {
			if (method.indexOf("POST") >= 0) {
				data["access_token"] = accessToken;
			} else if (method.indexOf(`GET`) >= 0) {
				if (url.indexOf("?") >= 0) {
					url = url + "&access_token=" + accessToken;
				} else {
					url = url + "?access_token=" + accessToken;
				}
			}
		}
	}
	return new Promise((resolve, reject) => {
		const response = {};
		wx.request({
			url,
			method,
			data,
			header,
			success: (res) => {
				if (
					res.data.result === "FAILED" &&
					res.data.data.error_code == "X011"
				) {
					wx.showToast({
						title: "权限不足，授权失败,请重新登录后进行操作",
						icon: "none",
					});
					setTimeout(() => {
						wx.reLaunch({
							url: "/pages/home/home",
						});
					}, 1500);
					return;
				}
				if (res.data.result === "SUCCESS") {
					response.success = res.data.data;
				} else {
					setTimeout(()=>{
						wx.showToast({
							title: res.data.data.error_code +
								"，" +
								res.data.data.error_msg +
								"，" +
								res.data.data.prompt_msg,
							icon: "none",
							duration: 2500,
						});
						response.fail = res.data.data;
					},1500)
				}
			},
			fail: (error) => {
				response.fail = error;
				setTimeout(() => {
					wx.showToast({
						title: "请求失败，网络异常",
						icon: "none",
						duration: 1500,
					});
				}, 70);
			},
			complete() {
				if (response.success) {
					resolve(response.success);
				} else {
					reject(response.fail);
				}
				console.groupEnd();
			},
		});
	});
}

// loading配置，请求次数统计
function startLoading() {
	wx.showLoading({
		title: "正在加载中",
		mask: true,
	});
}

function endLoading() {
	wx.hideLoading();
}
// 声明一个对象用于存储请求个数
let needLoadingRequestCount = 0;

function showFullScreenLoading() {
	if (needLoadingRequestCount === 0) {
		startLoading();
	}
	needLoadingRequestCount++;
}

function tryHideFullScreenLoading(url) {
	if (needLoadingRequestCount <= 0) return;
	setTimeout(() => {
		needLoadingRequestCount--;
		if (needLoadingRequestCount === 0) {
			endLoading();
		}
	}, 50);
}
