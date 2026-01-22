<template>
  <div class="container" ref="containerRef" data-allow-mismatch>
    <div class="search-info">
      <h2>{{ titleText }}</h2>
      <div v-if="hybird" style="display: flex; align-items: center; justify-content: center">
        <Icon name="line-md:hazard-lights-loop" size="20" style="margin-right: 8px"></Icon>混合搜索已启用
      </div>
    </div>
    <var-divider dashed />
    <div class="content-wrapper">
      <div v-if="result.list.length === 0" class="skeleton-wrapper">
        <var-skeleton :loading="true" :rows="8" />
      </div>
      <VirtualWaterfall :virtual="waterfallOption.virtual" :gap="waterfallOption.gap"
        :preload-screen-count="waterfallOption.preloadScreenCount" :item-min-width="waterfallOption.itemMinWidth"
        :max-column-count="waterfallOption.maxColumnCount" :min-column-count="waterfallOption.minColumnCount"
        :calc-item-height="calcItemHeight" :items="result.list" :enable-cache="waterfallOption.enableCache">
        <template #default="scope">
          <WaterfallCard v-if="scope?.item" :item="scope.item" />
        </template>
      </VirtualWaterfall>
    </div>
    <div class="index-footer" v-if="result.list.length > 0">
      <var-divider>
        <div style="
            font-size: large;
            margin: 0 16px;
            text-align: center;
            color: hsla(var(--hsl-text), 0.8);
          ">
          {{ tipText }}
        </div>
      </var-divider>
    </div>
  </div>
</template>

<script lang="ts" setup>
const { containerRef } = useWaterfallContainer()

const route = useRoute()
const keyword = computed(() => route.query.q?.toString() || '')
const hybird = computed(() => route.query.hybrid === 'true')
const similarTarget = computed(() => route.query.similar_target?.toString() || '')
if (!keyword && !similarTarget) {
  navigateTo('/search')
}
const titleText = computed(() =>
  keyword.value ? `"${keyword.value}"的搜索结果` : `"${similarTarget.value}"的相似作品`
)
useSeoMeta({
  title: titleText.value,
  ogTitle: titleText.value + ' | ManyACG',
  description: titleText.value + ' | ManyACG',
  ogDescription: titleText.value + ' | ManyACG',
  twitterDescription: titleText.value + ' | ManyACG',
  twitterTitle: titleText.value + ' | ManyACG',
  twitterCard: 'summary'
})

const { waterfallOption, result, calcItemHeight } = useWaterfall({
  hybrid: hybird.value,
  similarTarget: similarTarget.value,
  keyword: keyword.value,
  mode: 'index'
})

watch(
  [hybird, similarTarget, keyword],
  () => {
    // TODO: refactor this
    if (import.meta.client) {
      location.reload()
    }
  },
  { deep: true }
)

if (result.errorMessage) {
  showError({ statusCode: result.statusCode, statusMessage: '找不到你要搜索的内容' })
}

const tipText = computed(() => {
  if (result.end) {
    return ' ∑( 口 || 你居然看完了!'
  }
  return '正在加载, 别急 §(*￣▽￣*)§'
})
</script>

<style scoped>
.container {
  margin: 0 auto;
  max-width: 95%;
}

.search-info {
  margin-bottom: 2vh;
  text-align: center;
}

.content-wrapper {
  position: relative;
  min-height: 60vh;
}

.skeleton-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 10;
}

.index-footer {
  margin-top: 16px;
  height: 64px;
}

@media (max-width: 768px) {
  .container {
    max-width: 100%;
  }
}
</style>
