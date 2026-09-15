<template>
  <div class="container" ref="containerRef" data-allow-mismatch>
    <div class="search-header">
      <div class="search-header-bg"></div>
      <div class="search-info">
        <div class="search-icon-wrapper">
          <var-icon :name="similarTarget ? 'camera-outline' : 'magnify'" :size="32" />
        </div>
        <h2 class="search-title">{{ titleText }}</h2>
        <div v-if="hybird" class="hybrid-badge">
          <Icon name="line-md:hazard-lights-loop" size="18"></Icon>
          <span>AI 混合搜索</span>
        </div>
      </div>
    </div>

    <div class="content-section">
      <div class="content-wrapper">
        <div v-if="result.list.length === 0" class="skeleton-wrapper">
          <var-skeleton :loading="true" :rows="8" />
        </div>

        <VirtualWaterfall :virtual="waterfallOption.virtual" :gap="waterfallOption.gap"
          :preload-screen-count="waterfallOption.preloadScreenCount" :item-min-width="waterfallOption.itemMinWidth"
          :max-column-count="waterfallOption.maxColumnCount" :min-column-count="waterfallOption.minColumnCount"
          :calc-item-height="calcItemHeight" :items="result.list" :enable-cache="waterfallOption.enableCache">
          <template #default="scope">
            <WaterfallEntryCard v-if="scope?.item" :item="scope.item" />
          </template>
        </VirtualWaterfall>
      </div>
    </div>

    <div class="index-footer" v-if="result.list.length > 0">
      <var-divider>
        <div class="footer-text">
          <var-icon :name="result.end ? 'emoticon-happy-outline' : 'loading'" :size="20" />
          <span>{{ tipText }}</span>
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
    return '你居然看完了!'
  }
  return '正在加载更多...'
})
</script>

<style scoped>
.container {
  margin: 0 auto;
  max-width: 95%;
  padding-bottom: 40px;
}

.search-header {
  position: relative;
  margin: 0 -2.5% 40px;
  padding: 50px 2.5%;
  overflow: hidden;
  text-align: center;
}

.search-header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(192, 238, 240, 0.06);
}

.search-info {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.search-icon-wrapper {
  color: #39c5bb;
}

.search-title {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  color: hsla(var(--hsl-text), 0.9);
  letter-spacing: -0.5px;
  max-width: 80%;
  word-break: break-word;
}

.hybrid-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  background: rgba(255, 200, 0, 0.12);
  border-radius: 4px;
  border: 1px solid rgba(255, 200, 0, 0.35);
  color: #b8860b;
  font-size: 13px;
  font-weight: 600;
}

.content-section {
  margin-top: 32px;
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
  margin-top: 48px;
}

.footer-text {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  color: hsla(var(--hsl-text), 0.7);
}

@media (max-width: 768px) {
  .container {
    max-width: 100%;
  }

  .search-header {
    margin: 0 0 24px;
    padding: 32px 16px;
  }

  .search-title {
    font-size: 20px;
    max-width: 90%;
  }

  .hybrid-badge {
    font-size: 12px;
  }

  .section-title {
    font-size: 18px;
  }
}
</style>
