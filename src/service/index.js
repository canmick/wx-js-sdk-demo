import axios from "axios";

const config = require("../../config");

const service = axios.create({
  baseURL: config.baseUrl,
  timeout: 5000
});

// 添加请求拦截器
service.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    return config;
  },
  error => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 添加响应拦截器
service.interceptors.response.use(
  res => {
    // 对响应数据做点什么
    if (res.status == 200) {
      return res.data;
    }
  },
  err => {
    // 对响应错误做点什么
    return Promise.reject(err);
  }
);

export default service;
