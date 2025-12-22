<template>
  <div>
    <div class="container" ref="containerRef" data-allow-mismatch>
      <div class="artist-info">
        <var-space direction="row" justify="space-between">
          <var-space direction="column">
            <div class="artist-name">{{ artistData?.data.name }} 的作品</div>
            <div class="artist-username">
              {{ artistData?.data.username }}
            </div>
          </var-space>
          <div class="artist-source">
            {{ artistData?.data.type }}
          </div>
        </var-space>
      </div>
      <var-divider dashed margin="16px" />
      <var-skeleton :loading="result.list.length === 0" fullscreen></var-skeleton>
      <VirtualWaterfall
        :virtual="waterfallOption.virtual"
        :gap="waterfallOption.gap"
        :preload-screen-count="waterfallOption.preloadScreenCount"
        :item-min-width="waterfallOption.itemMinWidth"
        :max-column-count="waterfallOption.maxColumnCount"
        :min-column-count="waterfallOption.minColumnCount"
        :calc-item-height="calcItemHeight"
        :items="result.list"
        :enable-cache="waterfallOption.enableCache"
      >
        <template #default="scope">
          <WaterfallCard v-if="scope?.item" :item="scope.item" />
        </template>
      </VirtualWaterfall>
      <div class="index-footer" v-if="result.end && result.list.length > 0">
        <div style="font-size: large; margin: 0 16px; text-align: center">
          " ∑( 口 || 你居然看完了!"
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { ArtistResponse } from '~/types/artwork'

const route = useRoute()

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
}

.artist-info {
  margin-top: 5vh;
  margin-bottom: 3vh;
  padding: 0 32px;
}

.artist-name {
  font-size: 28px;
  font-weight: bold;
}

.artist-username {
  font-size: 16px;
  color: #666;
}

.artist-source {
  font-size: 24px;
  color: #666;
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
