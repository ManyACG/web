<template>
  <div class="waterfall" id="waterfall-container" ref="containerRef" data-allow-mismatch>
    <var-skeleton :loading="result.list.length === 0 && props.mode === 'random'" fullscreen></var-skeleton>
    <VirtualWaterfall :virtual="waterfallOption.virtual" :gap="waterfallOption.gap"
      :preload-screen-count="waterfallOption.preloadScreenCount" :item-min-width="waterfallOption.itemMinWidth"
      :max-column-count="waterfallOption.maxColumnCount" :min-column-count="waterfallOption.minColumnCount"
      :calc-item-height="calcItemHeight" :items="result.list" :enable-cache="waterfallOption.enableCache">
      <template #default="scope">
        <WaterfallCard v-if="scope?.item" :item="scope.item" :only-image="isSmall" />
      </template>
    </VirtualWaterfall>
    <div class="index-footer" v-if="result.list.length > 0">
      <var-divider>
        <div style="font-size: large; margin: 0 16px">{{ tipText }}</div>
      </var-divider>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    mode: 'random' | 'index'
  }>(),
  {
    mode: 'index'
  }
)

const { containerRef } = useWaterfallContainer()

const { waterfallOption, result, calcItemHeight } = useWaterfall({
  mode: props.mode
})

const isSmall = useSmallWindow()

if (result.errorMessage) {
  showError({ statusCode: result.statusCode, statusMessage: '网站似乎挂掉了' })
}

const tipText = computed(() => {
  if (result.end) {
    return ' ∑( 口 || 你居然看完了!'
  }
  return '正在加载, 别急 §(*￣▽￣*)§'
})
</script>

<style scoped>
.index-footer {
  margin-top: 16px;
  height: 64px;
}
</style>
