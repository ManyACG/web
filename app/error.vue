<template>
  <NuxtLayout>
    <div class="text">
      <h2>出错啦!</h2>

      <p>{{ error.statusMessage }}</p>

      <var-link type="primary" underline="none">
        <var-button size="large" @click="routerBack" title="返回"> 返回 </var-button>
      </var-link>
    </div>
  </NuxtLayout>
</template>

<script setup>
const error = useError()
</script>

<style scoped>
.text {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 90vh;
  flex-direction: column;
}
</style>
