const Router = require("koa-router");
const router = new Router();
const util = require("../utils/sign");
const getTicket = require("../utils/token");

router
  .get("/", async (ctx, next) => {
    ctx.body = "hello candyman";
    await next();
  })
  .get("/checkout", async (ctx, next) => {
    const { echostr, timestamp, nonce, signature } = ctx.query;
    // 签名验证来源
    const res = util.checkout({ timestamp, nonce, signature });
    // 签证正确时返回echostr
    ctx.body = res ? echostr : false;
    await next();
  })
  .post("/getSignature", async (ctx, next) => {
    try {
      const { url } = ctx.request.body;
      const jsapi_ticket = await getTicket();

      const sign = util.sign(jsapi_ticket, url);

      ctx.body = sign;
    } catch (err) {
      ctx.body = err;
    }
    await next();
  })
  .get("/getSignature", async (ctx, next) => {
    try {
      const { url } = ctx.query;
      const jsapi_ticket = await getTicket();

      const sign = util.sign(jsapi_ticket, url);

      ctx.body = sign;
    } catch (err) {
      ctx.body = err;
    }
    await next();
  });

module.exports = router;
