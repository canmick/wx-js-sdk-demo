const Koa = require("koa");
const app = new Koa();
const bodyParse = require("koa-bodyparser");
const router = require("./router");

app.use(bodyParse());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000, () => {
  console.log("node-service listening on http://localhost:3000");
});
