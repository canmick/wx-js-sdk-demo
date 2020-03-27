<template>
  <div class="home" @click="apiHandler">
    <template v-for="(val, key) in testApi">
      <div v-if="val.show" :key="key" class="margin-bottom-sm solid-bottom">
        <span>{{ val.title }}：</span>
        <button class="g-btn radius bg-green text-white" :data-api="key">
          {{ key }}
        </button>
        <div>
          结果:
          <div v-html="val.result"></div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
// @ is an alias to /src
export default {
  data() {
    return {
      localId: "",
      testApi: {
        chooseImage: {
          title: "获取图片",
          result: "null",
          show: true
        },
        uploadImage: {
          title: "上传图片",
          result: "null",
          show: true
        }
      }
    };
  },
  mounted() {
    // 新增接口
    this.$sdk.addJsApi(["chooseImage", "uploadImage", "getLocalImgData"]);
  },
  methods: {
    apiHandler(e) {
      const {
        localName,
        dataset: { api }
      } = e.target;

      if (localName !== "button" || !api) return;

      this.testApi[api]["result"] = "pending";
      this[api]();
    },
    setResult(api, data) {
      this.testApi[api]["result"] = data;
    },
    // 签名后调用接口
    async chooseImage() {
      try {
        const sdk = await this.$sdk.config();
        this.$sdk.confirm();

        sdk.chooseImage({
          count: 1, // 默认9
          sizeType: ["original", "compressed"], // 可以指定是原图还是压缩图，默认二者都有
          sourceType: ["album", "camera"], // 可以指定来源是相册还是相机，默认二者都有
          success: res => {
            this.localId = res.localIds[0];

            // localId可以作为img标签的src属性显示图片, ios端不支持直接使用，需使用getLocalImgData转为base64
            if (this.$util.isIos()) {
              return this.getLocalImgData(this.localId);
            }
            const img = `<div>localId:${this.localId}</div><img src=${this.localId} style='height:100px;width:auto;'/>`;
            this.setResult("chooseImage", img);
          },
          fail: err => {
            this.setResult("chooseImage", err);
          },
          cancel: () => {
            this.setResult("chooseImage", "cancel");
          }
        });
      } catch (err) {
        this.setResult("chooseImage", err);
      }
    },
    // 支持promise
    async uploadImage() {
      this.$sdk
        .config()
        .then(sdk => {
          this.$sdk.confirm();

          const { localId } = this;

          sdk.uploadImage({
            localId, // 需要上传的图片的本地ID，由chooseImage接口获得
            isShowProgressTips: 1, // 默认为1，显示进度提示
            success: res => {
              // 返回图片的服务器端ID
              this.setResult("uploadImage", res.serverId);
            },
            fail: err => {
              this.setResult("uploadImage", err);
            }
          });
        })
        .catch(err => {
          this.setResult("uploadImage", err);
        });
    },
    async getLocalImgData(localId) {
      try {
        const sdk = await this.$sdk.config();
        this.$sdk.confirm();
        sdk.getLocalImgData({
          localId, // 需要上传的图片的本地ID，由chooseImage接口获得
          isShowProgressTips: 1, // 默认为1，显示进度提示
          success: res => {
            // 返回图片的服务器端ID
            const img = `<div>localId:${localId}</div><img src=${res.localData} style='height:100px;width:auto;'/>`;
            this.setResult("chooseImage", img);
          },
          fail: err => {
            this.setResult("chooseImage", err);
          }
        });
      } catch (err) {
        this.setResult("chooseImage", err);
      }
    }
  }
};
</script>
