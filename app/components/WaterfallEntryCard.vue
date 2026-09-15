<template>
  <AdCard v-if="'ad' in item" :ad="item.ad" />
  <WaterfallCard v-else-if="'detail' in item" :item="item" :only-image="onlyImage" />
</template>

<script setup lang="ts">
import type { WaterfallEntry } from '~/types/artwork'

withDefaults(
  defineProps<{
    item: WaterfallEntry
    onlyImage?: boolean
  }>(),
  {
    onlyImage: false
  }
)
</script>
