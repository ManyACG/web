<template>
  <div>
    <var-dialog
      v-model:show="show"
      :lock-scroll="false"
      confirm-button-text="搜索"
      @confirm="handleSearch"
    >
      <var-input v-model.trim="keyword" @keydown.enter="handleSearch" />
      <var-space align="center" justify="center">
        <div style="margin-right: 4px; font-size: large; font-weight: bold">AI 搜索</div>
        <var-switch v-model="hybird" class="switch" size="20" variant />
      </var-space>
      <template #title>
        <var-space justify="space-between">
          <div>要搜索什么呢喵？</div>
          <var-link type="info" underline="hover" to="/about#search" @click="show = false">
            如何使用?
          </var-link>
        </var-space>
      </template>
    </var-dialog>
  </div>
</template>

<script lang="ts" setup>
const show = defineModel('show', { type: Boolean })
const keyword = ref('')
const hybird = ref(false)

const handleSearch = () => {
  if (!keyword.value) {
    navigateTo('/search')
  } else {
    navigateTo(`/search/result?q=${keyword.value}&hybrid=${hybird.value}`)
  }
  show.value = false
}
</script>

<style scoped>
.switch {
  margin-top: 10px;
}
</style>
