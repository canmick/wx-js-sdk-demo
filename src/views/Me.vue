<template>
  <div class="text-center">
    重置JS-SDK：
    <button
      class="g-btn radius bg-orange text-white padding-lr-sm"
      @click="reset"
    >
      reset
    </button>
  </div>
</template>

<script>
export default {
  methods: {
    reset() {
      this.$sdk.reset();
    }
  }
};
</script>
