import {
  get,
  API_ROOT,
} from '../request/network';

const app = getApp()

// 获取店铺设置信息
export function getStoreSetting() {
  const param = {
    store_n: app.globalData.store_n
  }
  const url = API_ROOT + '/1/setting/all';
  return get(url,param);
}

// 获取二维码映射信息
export function getQrcodeMp(qumN) {
  var param = {
    qrcode_url_mapping_n: qumN
  }
  const url = API_ROOT + '/1/qrcode/url/mapping/get';
  return get(url, param);
}
