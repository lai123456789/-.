import { get, post, postNotLoading, put, del, API_ROOT } from "./network.js";

export function myLogin(param) {
  const url = API_ROOT + "/1/login/in";
  return post(url, param);
}
export function myMobile(param){
    const url = API_ROOT + "/1/account/bind/mobile";
    return post(url, param);
}
