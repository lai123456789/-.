const formatTime = (date, separator) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  if (separator == "-") {
    return `${[year, month, day].map(formatNumber).join("-")}`;
  } else if (separator == "month") {
    return `${[year, month].map(formatNumber).join("-")}`;
  } else {
    return `${[year, month, day].map(formatNumber).join("")}`;
  }
  // return `${[year, month, day].map(formatNumber).join('')} ${[hour, minute, second].map(formatNumber).join(':')}`
};
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}
/*函数防抖*/
const _debounce = (fn, interval) => {
	var timer;
	var gapTime = interval || 1000; //间隔时间，如果interval不传，则默认1000ms
	return function() {
		clearTimeout(timer);
		// var context = this;
		// var args = arguments; //保存此处的arguments，因为setTimeout是全局的，arguments不是防抖函数需要的。
		timer = setTimeout(() => {
			fn.call(this, arguments);
		}, gapTime);
	};
}

// // 输入金额校验
// const numRegx = (value) => {
// 	let val = value
// 	if (val.indexOf(".") == 0) {
// 	  val = "0" + val;
// 	}
// 	val = val.replace(/[^\d.]/g, ""); //清除"数字"和"."以外的字符
// 	val = val.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的
// 	val = val.replace(/^0+\./g, "0.");
// 	val = val.match(/^0+[1-9]+/) ? (val = val.replace(/^0+/g, "")) : val;
// 	val = val.match(/^\d*(\.?\d{0,2})/g)[0] || "";
// 	val = val.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
// 	val = val.replace(/^(\-)*(\d+)\.(\d\d).*$/, "$1$2.$3"); //只能输入两个小数
// 	if (val.indexOf(".") < 0 && val != "") {
// 	  //以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额
// 	  val = parseFloat(val);
// 	}
// 	return val
// }

module.exports = {
  formatTime,
  _debounce
  // numRegx
}
