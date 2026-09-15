<template>
  <div class="container">
    <div class="text">
      <Icon name="i-line-md:search" size="26"></Icon>
      <h2>想看什么呢喵?</h2>
    </div>

    <div class="searchbar">
      <var-input
        type="text"
        placeholder="输入关键词搜索"
        class="search-input"
        variant="outlined"
        v-model="keyword"
        @keydown.enter="handleSearch"
      >
        <template #append-icon>
          <var-button @click="handleSearch" class="search-button" type="primary" size="large">
            搜索
          </var-button>
        </template>
      </var-input>
    </div>

    <div class="search-tips">
      <div style="font-size: larger">AI 搜索</div>
      <var-switch v-model="hybird" size="20" variant />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Snackbar } from '@varlet/ui'
useSeoMeta({
  title: '搜索',
  ogTitle: '搜索 | ManyACG',
  description: '搜索 | ManyACG',
  ogDescription: '搜索 | ManyACG',
  twitterDescription: '搜索 | ManyACG',
  twitterTitle: '搜索 | ManyACG',
  twitterCard: 'summary'
})

const keyword = ref('')
const hybird = ref(false)

const handleSearch = () => {
  if (!keyword.value) {
    Snackbar({
      content: '请输入要搜索的内容~',
      type: 'error'
    })
    return
  }
  navigateTo(`/search/result?q=${keyword.value}&hybrid=${hybird.value}`)
}
</script>

<style scoped>
.container {
  margin: 0 auto;
  max-width: 600px;
}

.text {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  margin-top: 10vh;
  margin-bottom: 2vh;
  text-align: center;
  gap: 10px;
}

.searchbar {
  display: flex;
  align-items: center;
  max-width: 600px;
  margin: 0 auto;
}

.search-input {
  flex-grow: 1;
}

.search-button {
  border-radius: 5px;
  cursor: pointer;
}

.search-tips {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 2vh;
}
</style>
