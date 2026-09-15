<template>
  <div class="container" ref="containerRef" data-allow-mismatch>
    <div class="tag-header">
      <div class="tag-header-bg"></div>
      <div class="tag-info">
        <div class="tag-badge">
          <var-icon name="tag" :size="24" />
          <h2 class="tag-name">{{ route.params.name }}</h2>
        </div>
        <div class="tag-subtitle">标签下的作品</div>
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

    <div class="index-footer" v-if="result.end && result.list.length > 0">
      <var-divider>
        <div class="footer-text">
          <var-icon name="emoticon-happy-outline" :size="20" />
          <span>你居然看完了!</span>
        </div>
      </var-divider>
    </div>
  </div>
</template>

<script lang="ts" setup>
const route = useRoute()
const tagName = route.params.name

useHead({
  title: `#${tagName}`
})

useSeoMeta({
  title: `#${tagName}`,
  ogTitle: `#${tagName} | ManyACG`,
  description: `${tagName}标签下的作品 | ManyACG`,
  ogDescription: `${tagName}标签下的作品 | ManyACG`,
  twitterDescription: `${tagName}标签下的作品 | ManyACG`,
  twitterTitle: `#${tagName} | ManyACG`,
  twitterCard: 'summary'
})

const { containerRef } = useWaterfallContainer()

const { waterfallOption, result, calcItemHeight } = useWaterfall({
  tag: `${route.params.name}`,
  mode: 'index'
})
</script>

<style scoped>
.container {
  margin: 0 auto;
  max-width: 95%;
  padding-bottom: 40px;
}

.tag-header {
  position: relative;
  margin: 0 -2.5% 40px;
  padding: 48px 2.5%;
  overflow: hidden;
  text-align: center;
}

.tag-header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(192, 238, 240, 0.06);
}

.tag-info {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.tag-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  border-radius: 8px;
  border: 1px solid rgba(57, 197, 187, 0.3);
  color: #39c5bb;
}

.tag-name {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: hsla(var(--hsl-text), 0.9);
}

.tag-subtitle {
  font-size: 16px;
  color: hsla(var(--hsl-text), 0.6);
  font-weight: 500;
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

  .tag-header {
    margin: 0 0 24px;
    padding: 32px 16px;
  }

  .tag-badge {
    padding: 8px 16px;
  }

  .tag-name {
    font-size: 20px;
  }
}
</style>
