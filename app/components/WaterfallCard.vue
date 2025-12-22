<template>
  <div>
    <var-paper ripple class="card" @click.left="handleCardClick(item)" @click.right.prevent="handleRightClick">
      <div :data-id="item.id" class="card-content" underline="none" rel="prefetch">
        <div class="cover" :style="{
          aspectRatio:
            firstPic?.width && firstPic?.height
              ? `${firstPic.width} / ${firstPic.height}`
              : '1 / 1'
        }">
          <Transition>
            <img v-if="thumbHashDataURL && !loaded" :src="thumbHashDataURL" :alt="item.detail.title" class="img"
              loading="lazy" />
          </Transition>
          <Transition>
            <img v-if="loaded" :src="firstPic?.thumbnail" :alt="item.detail.title" class="img" loading="lazy"
              ref="cardImage" />
          </Transition>
        </div>

        <div class="overlay" v-if="!onlyImage">
          <div class="card-body">
            <h3>{{ item.detail.title }}</h3>
            <div class="author">
              {{ item.detail.artist.name }}
            </div>
          </div>
        </div>
      </div>
    </var-paper>
    <var-image-preview v-model:show="showViewer" :images="item.detail.pictures.map((pic) => pic.regular)"
      close-on-key-escape closeable />
  </div>
</template>

<script setup lang="ts">
import type { WaterfallItem } from '~/types/artwork'
import { thumbHashToDataURL } from 'thumbhash'

const props = withDefaults(
  defineProps<{
    item: WaterfallItem
    onlyImage?: boolean
  }>(),
  {
    onlyImage: false
  }
)

const imageLoadCache = useState<Map<string, boolean>>('imageLoadCache', () => new Map())
const MAX_CACHE_SIZE = 1000

const addToCache = (id: string, loaded: boolean) => {
  if (imageLoadCache.value.size >= MAX_CACHE_SIZE) {
    const firstKey = imageLoadCache.value.keys().next().value
    if (firstKey) {
      imageLoadCache.value.delete(firstKey)
    }
  }
  imageLoadCache.value.set(id, loaded)
}

const firstPic = computed(() => props.item.detail.pictures?.[0])

const thumbHashDataURL = computed(() => {
  const hash = firstPic.value?.thumb_hash
  if (!hash) return ''
  try {
    const binary = atob(hash)
    const buffer = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      buffer[i] = binary.charCodeAt(i)
    }
    return thumbHashToDataURL(buffer)
  } catch (e) {
    console.error('thumbHash decode error:', e)
    return ''
  }
})

const loaded = ref(false)

onBeforeMount(() => {
  if (!firstPic.value?.thumbnail) {
    loaded.value = false
    return
  }
  const cachedStatus = imageLoadCache.value.get(firstPic.value.id)
  if (cachedStatus !== undefined) {
    loaded.value = cachedStatus
    return
  }
  const image = new Image()
  image.onload = () => {
    loaded.value = true
    addToCache(firstPic.value!.id, true)
  }
  image.onerror = (error) => {
    console.error(error)
    loaded.value = true
    addToCache(firstPic.value!.id, false)
  }
  image.src = firstPic.value.thumbnail
})

const showViewer = ref(false)

const handleCardClick = (item: WaterfallItem) => {
  useArtworkStore().addArtwork(item.detail)
  navigateTo({
    path: `/artwork/${item.id}`
  })
}

const handleRightClick = () => {
  showViewer.value = true
}
</script>

<style scoped>
.card {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 4px;
  cursor: pointer;
}

.card-content {
  width: 100%;
  height: 100%;
  display: block;
}

.cover {
  width: 100%;
  height: auto;
  position: relative;
}

.img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.action-button {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
}

.card:hover .img {
  transform: scale(1.12);
}

.card:hover .overlay {
  transform: translateY(0);
}

.overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: 10px;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.card-body {
  color: white;

  h3 {
    margin: 0 0 3px;
    font-size: 14px;
    font-weight: bold;
  }

  .author {
    font-size: 12px;
  }
}

@media (max-width: 768px) {
  .card {
    border-radius: 0;
  }

  .card:hover .img {
    transform: none;
  }
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.4s linear;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
