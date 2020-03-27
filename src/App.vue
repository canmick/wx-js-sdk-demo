<template>
  <div id="app" class="flex-column padding-sm">
    <div class="nav">
      <router-link to="/">Home</router-link>|
      <router-link to="/about">About</router-link>|
      <router-link to="/me">Me</router-link>
    </div>
    <!-- url信息 -->
    <ul class="margin-sm padding-xs">
      <li>
        <span>isIos:</span>
        {{ isIos }}
      </li>
      <li>
        <span>origin:</span>
        {{ origin }}
      </li>
      <li>
        <span>currentPath:</span>
        {{ $route.path }}
      </li>
      <li>
        <span>entryPath:</span>
        {{ entryPath }}
      </li>
      <li>
        <span>configOk:</span>
        {{ configOk }}
      </li>
    </ul>
    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  computed: {
    configOk() {
      return this.$sdk.configOk;
    },
    origin() {
      return window.location.origin;
    },
    currentPath() {
      return this.$route.path;
    },
    entryPath() {
      return window.entryUrl.replace(this.origin, "");
    },
    isIos() {
      return /iPhone|iPad|ios/gi.test(navigator.userAgent);
    }
  }
};
</script>

<style>
#app {
  color: #2c3e50;
  height: 100%;
}

.nav a {
  font-weight: bold;
  color: #2c3e50;
}

.nav a.router-link-exact-active {
  color: #42b983;
}
li span {
  font-weight: bold;
}
.content {
  border: 1px solid #999;
  height: 100%;
  padding: 6px;
  word-wrap: break-word;
}
.solid-bottom {
  border-bottom: 1px solid #aaa;
}
</style>
