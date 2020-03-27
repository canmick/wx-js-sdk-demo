const request = require("koa2-request");
const fs = require("fs");
const path = require("path");

const config = require("../../config");

const resolvePath = file => path.resolve(__dirname, file);

// 请求方法
const fetchData = async url => {
  try {
    const ops = {
      method: "get",
      url
    };
    return await request(ops);
  } catch (err) {
    console.log("fetchToken err", err);
    return Promise.reject(err);
  }
};

const fetchToken = () => {
  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config.appId}&secret=${config.secret}`;
  return fetchData(url);
};

const fetchTicket = token => {
  const url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${token}&type=jsapi`;
  return fetchData(url);
};

// 文件读取
const readTxt = async file => {
  try {
    const res = fs.readFileSync(resolvePath(file), {
      encoding: "utf8"
    });
    return JSON.parse(res) || {};
  } catch (err) {
    console.log("readTxt", err);
    return {};
  }
};
const writeTxt = (file, data) => {
  try {
    fs.writeFile(resolvePath(file), JSON.stringify(data), "utf8", err => {
      if (err) throw err;
    });
  } catch (err) {
    console.log("writeTxt", err);
  }
};
// access_token获取，缓存7200秒
const getToken = async () => {
  try {
    // 读取本地token
    const cache = readTxt("../cache/token.txt");
    let { access_token, timeStamp } = cache;

    const now = new Date().getTime();
    if (access_token && now - timeStamp < 7200 * 1000) {
      return access_token;
    }

    const res = await fetchToken();

    const obj = JSON.parse(res.body);

    access_token = obj.access_token;
    timeStamp = new Date().getTime();

    writeTxt("../cache/token.txt", { access_token, timeStamp });

    return access_token;
  } catch (err) {
    console.log("getToken err", err);
    return Promise.reject(err);
  }
};

// ticket获取，缓存7200秒
const getTicket = async () => {
  try {
    const cache = await readTxt("../cache/ticket.txt");
    let { ticket, timeStamp } = cache;

    const now = new Date().getTime();
    if (ticket && now - timeStamp < 7200 * 1000) {
      return ticket;
    }
    const token = await getToken();
    console.log("token", token);

    const res = await fetchTicket(token);

    const obj = JSON.parse(res.body);
    ticket = obj.ticket;
    timeStamp = new Date().getTime();

    writeTxt("../cache/ticket.txt", { ticket, timeStamp });

    return ticket;
  } catch (err) {
    console.log("getTicket err", err);
    return Promise.reject(err);
  }
};

module.exports = getTicket;
