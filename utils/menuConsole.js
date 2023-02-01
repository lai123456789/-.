import { get, post, postNotLoading, put, del, API_ROOT } from '../request/network';
const app = getApp()
/**
 * 校验控制台是否存在
 * @param {*} mpN 
 * @param {*} consoleType PLEDGE("预下菜单"), CONSUMER("先消费后买单"), TAKEOUT("外卖（自送、跑腿）")
 */
export function menuConsoleExist(mpN) {
  var param = {
    store_n: app.globalData.store_n,
    mp_n: mpN
  }
  const url = API_ROOT + '/1/menu/console/exist';
  return post(url, param);
}
/**
 * 修改控制台备注
 * @param {控制台编号} consoleN 
 * @param {备注} remark 
 */
export function menuConsoleRemark(consoleN, remark) {
  var param = {
    console_n: consoleN,
    remark: remark
  }
  const url = API_ROOT + '/1/menu/console/remark';
  return post(url, param);
}
