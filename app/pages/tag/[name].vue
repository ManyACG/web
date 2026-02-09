<template>
  <div class="container" ref="containerRef" data-allow-mismatch>
    <div class="tag-header">
      <div class="tag-header-bg" :style="{ background: tagColorTheme.gradient }"></div>
      <div class="tag-info">
        <div class="tag-badge"
          :style="{ borderColor: tagColorTheme.bgLight, boxShadow: `0 8px 32px ${tagColorTheme.bgLight}` }">
          <var-icon name="tag" :size="28" :style="{ color: tagColorTheme.color }" />
          <h2 class="tag-name" :style="{ color: tagColorTheme.color }">{{ route.params.name }}</h2>
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
            <WaterfallCard v-if="scope?.item" :item="scope.item" />
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

// 根据标签名生成颜色主题
type TagColorTheme = {
  name: string
  gradient: string
  color: string
  bgLight: string
  bgDark: string
}

const tagColorTheme = computed<TagColorTheme>(() => {
  const themes: TagColorTheme[] = [
    { name: 'pink', gradient: 'linear-gradient(135deg, rgba(249, 47, 96, 0.12) 0%, rgba(192, 238, 240, 0.15) 100%)', color: '#f92f60', bgLight: 'rgba(249, 47, 96, 0.15)', bgDark: 'rgba(249, 47, 96, 0.2)' },
    { name: 'purple', gradient: 'linear-gradient(135deg, rgba(156, 39, 176, 0.12) 0%, rgba(103, 58, 183, 0.15) 100%)', color: '#9c27b0', bgLight: 'rgba(156, 39, 176, 0.15)', bgDark: 'rgba(156, 39, 176, 0.2)' },
    { name: 'blue', gradient: 'linear-gradient(135deg, rgba(33, 150, 243, 0.12) 0%, rgba(57, 197, 187, 0.15) 100%)', color: '#2196f3', bgLight: 'rgba(33, 150, 243, 0.15)', bgDark: 'rgba(33, 150, 243, 0.2)' },
    { name: 'green', gradient: 'linear-gradient(135deg, rgba(76, 175, 80, 0.12) 0%, rgba(139, 195, 74, 0.15) 100%)', color: '#4caf50', bgLight: 'rgba(76, 175, 80, 0.15)', bgDark: 'rgba(76, 175, 80, 0.2)' },
    { name: 'orange', gradient: 'linear-gradient(135deg, rgba(255, 152, 0, 0.12) 0%, rgba(255, 193, 7, 0.15) 100%)', color: '#ff9800', bgLight: 'rgba(255, 152, 0, 0.15)', bgDark: 'rgba(255, 152, 0, 0.2)' },
    { name: 'red', gradient: 'linear-gradient(135deg, rgba(244, 67, 54, 0.12) 0%, rgba(233, 30, 99, 0.15) 100%)', color: '#f44336', bgLight: 'rgba(244, 67, 54, 0.15)', bgDark: 'rgba(244, 67, 54, 0.2)' },
    { name: 'teal', gradient: 'linear-gradient(135deg, rgba(0, 150, 136, 0.12) 0%, rgba(77, 182, 172, 0.15) 100%)', color: '#009688', bgLight: 'rgba(0, 150, 136, 0.15)', bgDark: 'rgba(0, 150, 136, 0.2)' },
    { name: 'indigo', gradient: 'linear-gradient(135deg, rgba(63, 81, 181, 0.12) 0%, rgba(92, 107, 192, 0.15) 100%)', color: '#3f51b5', bgLight: 'rgba(63, 81, 181, 0.15)', bgDark: 'rgba(63, 81, 181, 0.2)' }
  ]

  // 根据标签名的哈希值选择颜色
  let hash = 0
  const str = String(tagName)
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % themes.length
  const fallbackTheme = themes[0]!
  return themes[index] ?? fallbackTheme
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
  padding: 60px 2.5%;
  overflow: hidden;
  text-align: center;
}

.tag-header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  backdrop-filter: blur(10px);
}

.tag-info {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.tag-badge {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 16px 32px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(20px);
  border-radius: 50px;
  border: 1px solid;
  transition: all 0.3s ease;
}

@media (prefers-color-scheme: dark) {
  .tag-badge {
    background: rgba(255, 255, 255, 0.08);
  }
}

.tag-name {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
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
    padding: 40px 16px;
  }

  .tag-badge {
    padding: 12px 24px;
  }

  .tag-name {
    font-size: 22px;
  }
}
</style>
