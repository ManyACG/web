<template>
  <div>
    <div class="container" ref="containerRef" data-allow-mismatch>
      <div class="artist-header">
        <div class="artist-header-bg"></div>
        <div class="artist-info">
          <div class="artist-details">
            <div class="artist-name">
              <var-icon name="palette" :size="32" />
              <span>{{ artistData?.data.name }}</span>
            </div>
            <div class="artist-meta">
              <span class="artist-username">
                <var-icon name="account" :size="16" />
                {{ artistData?.data.username }}
              </span>
              <span class="artist-source-badge">
                {{ artistData?.data.type }}
              </span>
            </div>
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
  </div>
</template>

<script lang="ts" setup>
import type { ArtistResponse } from '~/types/artwork'

const route = useRoute()

const { containerRef } = useWaterfallContainer()

const { waterfallOption, result, calcItemHeight } = useWaterfall({
  artistId: `${route.params.id}`,
  mode: 'index'
})

const { data: artistData, error } = await useAcgapiData<ArtistResponse>(
  `/artist/${route.params.id}`
)
if (error.value) {
  throw createError({
    statusCode: error.value.statusCode,
    message: error.value.message
  })
}

useHead({
  title: `${artistData.value?.data.name} 的作品`
})

useSeoMeta({
  description: `${artistData.value?.data.name} 的作品 | ManyACG`,
  ogTitle: `${artistData.value?.data.name} 的作品 | ManyACG`,
  ogDescription: `${artistData.value?.data.name} 的作品 | ManyACG`,
  twitterDescription: `${artistData.value?.data.name} 的作品 | ManyACG`,
  twitterTitle: `${artistData.value?.data.name} 的作品 | ManyACG`,
  twitterCard: 'summary'
})
</script>

<style scoped>
.container {
  margin: 0 auto;
  max-width: 95%;
  padding-bottom: 40px;
}

.artist-header {
  position: relative;
  margin: 0 -2.5% 40px;
  padding: 40px 2.5%;
  overflow: hidden;
}

.artist-header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(192, 238, 240, 0.15) 0%, rgba(57, 197, 187, 0.1) 100%);
  backdrop-filter: blur(10px);
}

.artist-info {
  position: relative;
  z-index: 1;
}

.artist-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 32px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(192, 238, 240, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

@media (prefers-color-scheme: dark) {
  .artist-details {
    background: rgba(192, 238, 240, 0.08);
    border: 1px solid rgba(192, 238, 240, 0.25);
  }
}

.artist-name {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 32px;
  font-weight: 700;
  color: hsla(var(--hsl-text), 0.95);
  letter-spacing: -0.5px;
}

.artist-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.artist-username {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  color: hsla(var(--hsl-text), 0.7);
  padding: 6px 12px;
  background: rgba(192, 238, 240, 0.25);
  border-radius: 8px;
}

@media (prefers-color-scheme: dark) {
  .artist-username {
    background: rgba(192, 238, 240, 0.12);
    color: hsla(var(--hsl-text), 0.85);
  }
}

.artist-source-badge {
  padding: 6px 16px;
  background: rgba(57, 197, 187, 0.15);
  color: #39c5bb;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid rgba(57, 197, 187, 0.3);
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

  .artist-header {
    margin: 0 0 24px;
    padding: 24px 16px;
  }

  .artist-details {
    padding: 16px;
  }

  .artist-name {
    font-size: 24px;
  }

  .artist-meta {
    gap: 12px;
  }
}
</style>
