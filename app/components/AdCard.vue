<template>
  <a class="ad-card" :href="ad.link" target="_blank" rel="noopener noreferrer sponsored">
    <img class="ad-image" :src="ad.image" alt="广告" :width="ad.width" :height="ad.height" loading="lazy"
      decoding="async" :style="{ aspectRatio: `${ad.width} / ${ad.height}` }" />
  </a>
</template>

<script setup lang="ts">
import type { AdItem } from '~/types/artwork'

defineProps<{
  ad: AdItem
}>()
</script>

<style scoped>
.ad-card {
  display: block;
  width: 100%;
  border-radius: 4px;
  overflow: hidden;
  line-height: 0;
}

.ad-image {
  display: block;
  width: 100%;
  height: auto;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.ad-card:hover .ad-image {
  transform: scale(1.12);
}

@media (max-width: 768px) {
  .ad-card {
    border-radius: 0;
  }

  .ad-card:hover .ad-image {
    transform: none;
  }
}
</style>
