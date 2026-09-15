<template>
  <div>
    <div class="index-contanier">
      <waterfall-content mode="index" with-ad />
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'ManyACG - 二次元美图精选收集',
  titleTemplate: '%s'
})
</script>

<style scoped>
.index-contanier {
  margin: 0 auto;
}

.title-text {
  font-size: 24px;
  font-weight: bold;
}
</style>
