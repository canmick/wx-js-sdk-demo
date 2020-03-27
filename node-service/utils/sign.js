const config = require("../../config");

const createNonceStr = () => {
  return Math.random()
    .toString(36)
    .substr(2, 15);
};

const createTimestamp = () => {
  return parseInt(new Date().getTime() / 1000) + "";
};

// 排序
const raw = args => {
  let keys = Object.keys(args);
  keys = keys.sort();
  const newArgs = {};
  keys.forEach(function(key) {
    newArgs[key.toLowerCase()] = args[key];
  });

  let string = "";
  for (let k in newArgs) {
    string += "&" + k + "=" + newArgs[k];
  }
  string = string.substr(1);
  return string;
};

// 签名算法
const sign = (jsapi_ticket, url) => {
  const ret = {
    jsapi_ticket,
    url,
    // url: decodeURIComponent(url), //前端encode后的url必须先decode
    nonceStr: createNonceStr(),
    timestamp: createTimestamp()
  };
  const string = raw(ret),
    sha1 = require("js-sha1");

  ret.signature = sha1(string);
  ret.appId = config.appId;
  return ret;
};

// 字典排序
const sort = (...args) => {
  return args.sort().join("");
};

// 验证请求是否来自微信服务器
const checkout = obj => {
  const { signature, timestamp, nonce } = obj;
  const token = config.token;
  const string = sort(nonce, timestamp, token),
    sha1 = require("js-sha1");

  return signature === sha1(string);
};

module.exports = { sign, checkout };
