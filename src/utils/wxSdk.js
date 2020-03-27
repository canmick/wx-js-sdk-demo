const jsSdk = require("jweixin-module");

import Vue from "vue";
// 此处引入验证sdk的接口
import { getSignature } from "@/service/api";

import { isIos } from "./index";

class WxSdk {
  constructor(jsApiList = ["getLocation", "scanQRCode", "openLocation"]) {
    this.configOk = false;
    this.jsApiList = jsApiList;
  }
  setJsApi(list = []) {
    this.jsApiList = list;
    this.reset();
  }
  addJsApi(list = []) {
    this.jsApiList = [...new Set([...this.jsApiList, ...list])];
    console.log(this.jsApiList);

    this.reset();
  }
  reset() {
    this.configOk = false;
  }
  confirm() {
    this.configOk = true;
  }
  // 签名验证
  async config() {
    try {
      if (this.configOk) return Promise.resolve(jsSdk);

      const url = isIos()
        ? window.entryUrl
        : window.location.href.split("#")[0];
      // encode url
      // let url = window.location.href.split("#")[0];
      // url = encodeURIComponent(url);
      const { appId, timestamp, nonceStr, signature } = await getSignature(url);

      const { jsApiList } = this;
      // require subscribe错误说明你没有订阅该测试号，该错误仅测试号会出现
      jsSdk.config({
        debug: false,
        appId,
        timestamp,
        nonceStr,
        signature,
        jsApiList
      });
      return new Promise((resolve, reject) => {
        // ready不一定config成功...
        jsSdk.ready(() => {
          console.log("ready");
          resolve(jsSdk);
        });
        // 有error 的话会比ready先执行
        jsSdk.error(err => {
          console.log("err");
          reject(err);
        });
      });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  async getLocation() {
    try {
      await this.config();
    } catch (err) {
      return Promise.reject(err);
    }

    return new Promise((resolve, reject) => {
      jsSdk.getLocation({
        type: "gcj02",
        success: result => {
          resolve(result);
          // api 调用成功才算config ok
          !this.configOk && this.confirm();
        },
        fail: err => {
          this.reset();
          reject(err);
        }
      });
    });
  }
  async openLocation(ops = {}) {
    try {
      await this.config();
    } catch (err) {
      return Promise.reject(err);
    }

    return new Promise((resolve, reject) => {
      jsSdk.openLocation({
        latitude: 0, // 纬度，浮点数，范围为90 ~ -90
        longitude: 0, // 经度，浮点数，范围为180 ~ -180。
        name: "测试打开地图", // 位置名
        address: "奥特曼故居", // 地址详情说明
        scale: 17, // 地图缩放级别,整形值,范围从1~28。默认为最大
        infoUrl: "",
        ...ops, // 在查看位置界面底部显示的超链接,可点击跳转
        success: result => {
          resolve(result);
          // api 调用成功才算config ok
          !this.configOk && this.confirm();
        },
        fail: err => {
          this.reset();
          reject(err);
        }
      });
    });
  }
  // 添加callback
  async scanQRCode(callback) {
    try {
      await this.config();
    } catch (err) {
      return Promise.reject(err);
    }
    return new Promise((resolve, reject) => {
      jsSdk.scanQRCode({
        needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
        scanType: ["qrCode", "barCode"], // 可以指定扫二维码还是一维码，默认二者都有
        success: res => {
          // 当needResult 为 1 时，扫码返回的结果
          resolve(res.resultStr);

          !this.configOk && this.confirm();

          callback && callback([null, res.resultStr]);
        },
        fail: err => {
          this.reset();
          reject(err);
          callback && callback([err, null]);
        },
        cancel: () => {
          resolve("cancel");
          !this.configOk && this.confirm();
          callback && callback(["cancel", null]);
        }
      });
    });
  }
}

const wxSdk = new WxSdk();

// export default wxSdk

// 测试环境观测config变化
export default Vue.observable(wxSdk);
