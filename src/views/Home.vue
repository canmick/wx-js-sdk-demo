<template>
  <div class="home" @click="apiHandler">
    <template v-for="(val, key) in testApi">
      <div
        v-if="val.show"
        :key="key"
        class="margin-bottom-sm solid-bottom padding-bottom-sm"
      >
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
  name: "Home",
  data() {
    return {
      location: {
        latitude: "23.00",
        longitude: "113.00"
      },
      testApi: {
        getLocation: {
          title: "获取定位",
          result: "null",
          show: true
        },
        openLocation: {
          title: "打开地图",
          result: "null",
          show: true
        },
        scanQRCode: {
          title: "扫一扫",
          result: "null",
          show: true
        }
      }
    };
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
    // 获取定位 async/await
    async getLocation() {
      try {
        const res = await this.$sdk.getLocation();

        const { latitude, longitude } = res;
        this.location = { latitude, longitude };

        this.setResult("getLocation", res);
      } catch (err) {
        this.setResult("getLocation", err);
      }
    },
    // 查看位置 promise
    openLocation() {
      this.$sdk
        .openLocation(this.location)
        .then(res => {
          this.setResult("openLocation", res);
        })
        .catch(err => {
          this.setResult("openLocation", err);
        });
    },
    // 扫一扫 callback
    async scanQRCode() {
      this.$sdk.scanQRCode(([err, res] = []) => {
        if (err) {
          // do something
        }
        this.setResult("scanQRCode", err || res);
      });
    }
  }
};
</script>
