import {
	get,
	post,
	postNotLoading,
	put,
	del,
	API_ROOT
} from "./network.js";
// 附近店铺
export function getStoreMapping(param) {
	const url = API_ROOT + "/1/store/mapping";
	return post(url, param);
}
// 查询支付距离
export function _getLocationData(param) {
	const url = API_ROOT + "/1/distance/is_pay";
	return post(url, param);
}
//请求附近店家
export function getStoreNearby(param) {
	const url = API_ROOT + "/1/store/page";
	return post(url, param);
}
//获取分类列表
export function getCatesList(param) {
	const url = API_ROOT + "/1/store/type/list";
	return post(url, param);
}
// 检测是否超出付款范围
export function getLocationData(param) {
	const url = API_ROOT + "/1/distance/is_pay";
	return post(url, param);
}
// 获取用户信息
export function getUserInfo(param) {
	const url = API_ROOT + "/1/account/info";
	return post(url, param);
}
//创建订单
export function createdOrder(param) {
	const url = API_ROOT + "/1/order/create";
	return post(url, param);
}
// 存入用户信息
export function modifyUserInfo(param) {
	const url = API_ROOT + "/1/user/modify";
	return post(url, param);
}
// 消费金订单
export function prepaidOrder(param) {
	const url = API_ROOT + "/1/order/prepaid";
	return postNotLoading(url, param);
}
// 消费金订单
export function getTradeInfo(param) {
	const url = API_ROOT + "/1/trade/info";
	return post(url, param);
}
// 获取店铺信息
export function getStoreInfo(param) {
	const url = API_ROOT + "/1/store/get";
	return post(url, param);
}
// 获取消费金流水
export function getGoldFlow(param) {
	const url = API_ROOT + "/1/account/flow";
	return post(url, param);
}
// 获取消费金按时间统计
export function getGoldFlowCount(param) {
	const url = API_ROOT + "/1/account/flow/count";
	return post(url, param);
}
// 通码请求店铺编码
export function selectStoreNByQrNo(param) {
	const url = API_ROOT + "/1/qr/selectStoreNByQrNo";
	return post(url, param);
}
// 卡券列表
export function cardVoucherList(param) {
	const url = API_ROOT + "/1/coupon/userCouponList";
	return post(url, param);
}
// 首页获取体验券列表
export function experienceVoucherList(param) {
	const url = API_ROOT + "/1/coupon/experience/showNewList";
	return post(url, param);
}
// 领取体验券
export function toGetExperienceVoucher(param) {
	const url = API_ROOT + "/1/coupon/experience/receive";
	return post(url, param);
}
