<template>
  <var-loading type="wave" :loading="loading">
    <var-result type="error" :description="loadErrorText" v-if="loadError" />
    <var-image
      :src="regular"
      position="center"
      lazy
      @load="onLoaded(index)"
      @error="onError"
      :loading="thumbnail"
      :alt="`第${index + 1}张图片`"
      @click="previewImage(index)"
      class="image"
    />
  </var-loading>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
const props = defineProps<{
  index: number
  regular: string
  thumbnail: string
}>()

const emit = defineEmits(['preview', 'load'])

const previewImage = (index: number) => {
  emit('preview', index)
}

const onLoaded = (index: number) => {
  loading.value = false
  emit('load', index)
}

const loading = ref(true)
const loadError = ref(false)
const loadErrorText = ref('图片被吃掉了(´;ω;`)')

const onThumbnailLoaded = () => {
  emit('load', props.index)
}

const onError = () => {
  loadError.value = true
  loading.value = false
}

onMounted(() => {
  const thumbnailImg = new Image()
  thumbnailImg.onload = onThumbnailLoaded
  thumbnailImg.onerror = onError
  thumbnailImg.src = props.thumbnail
})
</script>

<style scoped>
.image {
  cursor: zoom-in;
}
</style>
