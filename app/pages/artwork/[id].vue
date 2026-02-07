<template>
  <div data-allow-mismatch>
    <ClientOnly>
      <var-progress :value="downloadProgress" v-if="downloadProgress > 0" />
    </ClientOnly>

    <Transition>
      <div class="container" v-show="!loading">
        <div v-if="loading" class="skeleton-wrapper">
          <var-skeleton :loading="true" :rows="12" />
        </div>
        <div class="artwork-container" :class="{ 'vertical-layout': hasWideImage }">
          <div class="artwork-pictures">
            <div class="pictures-container">
              <div class="picture-card var-elevation--2" v-for="(picture, index) in artwork?.pictures" :key="picture.id"
                :style="{ width: pictureWidth(picture), height: 'auto' }">
                <detail-image :index="index" :regular="picture.regular" :thumbnail="picture.thumbnail"
                  @preview="previewImage" @load="imageLoad" />
              </div>
            </div>
          </div>
          <div class="artwork-info">
            <div class="artwork-title">{{ artwork?.title }}</div>
            <div class="author-source-section">
              <var-link class="info-link artwork-artist" underline="none" :to="`/artist/${artwork?.artist.id}`">
                <var-icon name="account-circle" />
                {{ artwork?.artist.name }}
              </var-link>

              <var-link underline="none" class="info-link source-url-link" :href="artwork?.source_url" target="_blank"
                rel="noopener noreferrer">
                → {{ artwork?.source_type }}
              </var-link>
            </div>

            <div class="artwork-description scrollable-content">
              <div style="white-space: pre-wrap">
                {{ artwork?.description || '作者什么都没说呢喵' }}
              </div>
            </div>

            <div class="tags-section" v-if="artwork?.tags?.length">
              <div class="tags-header">
                <var-icon name="tag-multiple" size="16" />
                <span class="tags-label">标签</span>
              </div>
              <div class="artwork-tags">
                <tag-chip v-for="tag in artwork?.tags" :key="tag" :text="tag" />
              </div>
            </div>

            <div class="artwork-action">
              <var-button @click="routerBack" size="large" title="返回">
                <var-icon name="chevron-left" />
              </var-button>
              <var-button size="large" text-color="#39c5bb" @click="downloadPictures" :loading="!downloadAvailable"
                title="下载">
                <var-icon name="download-outline" />
              </var-button>
              <var-button size="large" title="相关推荐" text-color="#f92f60" @click="searchSimilar">
                <var-icon name="camera-outline" />
              </var-button>
            </div>
          </div>
        </div>

        <div class="artwork-similar">
          <var-divider>
            <div class="similar-title">相关推荐</div>
          </var-divider>
          <VirtualWaterfall v-bind="waterfallOption" :calc-item-height="calcItemHeight" :items="result.list">
            <template #default="scope">
              <WaterfallCard v-if="scope?.item" :item="scope.item" />
            </template>
          </VirtualWaterfall>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onDeactivated, onActivated } from 'vue'
import { BlobReader, BlobWriter, ZipWriter } from '@zip.js/zip.js'
import filesaver from 'file-saver'
const { saveAs } = filesaver
import { ImagePreview, Snackbar } from '@varlet/ui'
import asyncPool from 'tiny-async-pool'
import type { Artwork, ArtworkDetailResponse, Picture } from '~/types/artwork'

const route = useRoute()
const artworkStore = useArtworkStore()
const artworkId = route.params.id as string

const BACKGROUND_DELAY = 1000
const DOWNLOAD_CONCURRENCY = 3
const SNACKBAR_CLEAR_DELAY = 3000

const artwork = ref<Artwork | null>(artworkStore.getArtwork(artworkId))
const downloadAvailable = ref(false)
const loading = ref(true)
const downloadedCount = ref(0)

const pictureRegularUrls = computed(() => artwork.value?.pictures.map((p) => p.regular) || [])
const downloadProgress = computed(() => {
  if (!artwork.value?.pictures?.length) return 0
  return (downloadedCount.value / artwork.value.pictures.length) * 100
})

// 检测是否有超宽图片（宽高比 > 2）
const hasWideImage = computed(() => {
  if (!artwork.value?.pictures?.length) return false
  return artwork.value.pictures.some((picture) => picture.width / picture.height > 2)
})

const pictureWidth = (picture: Picture) => {
  const aspectRatio = picture.width / picture.height
  // 如果有超宽图片，在垂直布局下所有图片都占满宽度
  if (hasWideImage.value) {
    return '100%'
  }
  // 原有逻辑：横图100%，竖图按比例
  return aspectRatio > 1 ? '100%' : `${aspectRatio * 100}%`
}

const showSnackbar = (content: string, type: 'success' | 'error' | 'warning' = 'error') => {
  Snackbar({ content, position: 'bottom', type })
}

const handleApiError = (error: any, response?: any) => {
  if (response?.status === 401) {
    throw new Error('这张图片需要登录后才能下载哦')
  }
  throw new Error(error.message || `响应失败: ${response?.statusText || response?.status}`)
}

const { waterfallOption, result, calcItemHeight } = useWaterfall({
  similarTarget: artworkId
})

// 获取作品数据
if (!artwork.value) {
  try {
    const data = await $acgapi<ArtworkDetailResponse>(`/artwork/${artworkId}`)
    if (data.status === 200) {
      artwork.value = data.data
      downloadAvailable.value = true
    }
  } catch {
    throw createError({
      status: 500,
      statusMessage: '获取作品失败'
    })
  }
} else {
  downloadAvailable.value = true
}

const setupSEO = () => {
  if (!artwork.value) return

  useHead({ title: artwork.value.title })

  const ogImageUrl = artwork.value.r18
    ? '/og-image/nsfw.webp'
    : artwork.value.pictures?.[0]?.regular.endsWith('.avif')
      ? `https://wsrv.unv.app/?url=${artwork.value.pictures[0].regular}&output=jpg`
      : artwork.value.pictures?.[0]?.regular
  const seoData = {
    description: artwork.value.description,
    ogTitle: `${artwork.value.title} | ManyACG`,
    ogDescription: artwork.value.description,
    ogImage: ogImageUrl,
    ogType: 'article' as const,
    twitterCard: 'summary_large_image' as const,
    twitterTitle: `${artwork.value.title} | ManyACG`,
    twitterDescription: artwork.value.description,
    twitterImage: ogImageUrl
  }

  useSeoMeta(seoData)
}

setupSEO()

const setBackgroundImage = () => {
  const firstPicture = artwork.value?.pictures?.[0]
  if (!firstPicture) return
  setTimeout(() => {
    document.body.style.backgroundImage = `url(${firstPicture.regular})`
  }, BACKGROUND_DELAY)
}

const clearBackgroundImage = () => {
  document.body.style.backgroundImage = ''
}

const imageLoad = (index: number) => {
  if (index === 0) {
    loading.value = false
    setBackgroundImage()
  }
}

onDeactivated(clearBackgroundImage)
onActivated(() => {
  if (!loading.value) setBackgroundImage()
})

// 下载功能
const downloadSinglePicture = async (picture: Picture) => {
  const resp = await $acgapi<Blob>(`/picture/file/${picture.id}`, {
    onRequestError: ({ error }) => handleApiError(error),
    onResponseError: ({ response }) => handleApiError(null, response)
  })

  if (resp) {
    saveAs(resp, picture.file_name)
    Snackbar.clear()
  }
}

const downloadMultiplePictures = async () => {
  const zip = new ZipWriter(new BlobWriter('application/zip'), { zip64: true })
  const failedDownloads: string[] = []

  const downloadPicture = async (picture: Picture) => {
    try {
      const resp = await $acgapi<Blob>(`/picture/file/${picture.id}`, {
        onRequestError: ({ error }) => handleApiError(error),
        onResponseError: ({ response }) => handleApiError(null, response)
      })

      if (resp) {
        await zip.add(picture.file_name, new BlobReader(resp))
      } else {
        throw new Error('响应为空')
      }
      return picture.file_name
    } catch (error) {
      failedDownloads.push(picture.file_name)
      throw error
    }
  }

  for await (const fileName of asyncPool(
    DOWNLOAD_CONCURRENCY,
    artwork.value!.pictures || [],
    downloadPicture
  )) {
    downloadedCount.value++
  }

  if (failedDownloads.length > 0) {
    showSnackbar(`有 ${failedDownloads.length} 张图片下载失败`, 'warning')
  }

  const zipFile = await zip.close()
  saveAs(zipFile, `${artwork.value!.title}.zip`)
  showSnackbar('下载完成', 'success')
}

const downloadPictures = async () => {
  if (!downloadAvailable.value || !artwork.value || !artwork.value.pictures?.length) return

  downloadAvailable.value = false
  try {
    if (artwork.value.pictures.length === 1) {
      await downloadSinglePicture(artwork.value.pictures[0]!)
    } else {
      await downloadMultiplePictures()
    }
  } catch (e: any) {
    showSnackbar(`下载过程发生错误: ${e.message}`)
  } finally {
    downloadAvailable.value = true
    downloadedCount.value = 0
    setTimeout(() => Snackbar.clear(), SNACKBAR_CLEAR_DELAY)
  }
}

const previewImage = (index: number) => {
  ImagePreview({
    images: pictureRegularUrls.value,
    initialIndex: index,
    closeable: true,
    closeOnKeyEscape: true
  })
}

const searchSimilar = () => {
  navigateTo(`/search/result?similar_target=${artworkId}`)
}
</script>

<style scoped>
.artwork-container {
  display: flex;
  gap: 20px;
}

/* 超宽图片时的垂直布局 */
.artwork-container.vertical-layout {
  flex-direction: column;
}

.artwork-container.vertical-layout .artwork-pictures {
  max-width: 100%;
  max-height: none;
}

.artwork-container.vertical-layout .artwork-info {
  max-width: 100%;
  height: auto;
  max-height: 70vh;
}

.artwork-container.vertical-layout .artwork-description.scrollable-content {
  max-height: 200px;
}

.artwork-container.vertical-layout .artwork-tags {
  max-height: 80px;
}

.artwork-container.vertical-layout .picture-card {
  width: 100% !important;
}

.artwork-pictures {
  flex: 1;
  max-width: 70%;
  max-height: 90vh;
  overflow-y: auto;
  scroll-behavior: smooth;
  scrollbar-width: none;
  background-color: rgba(192, 238, 240, 0.2);
  border-radius: 4px;
}

.pictures-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: center;
  padding: 8px;
}

.picture-card {
  margin: 0 auto;
  transition: all 0.3s ease;
  border-radius: 8px;
  overflow: hidden;
}

.artwork-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 30%;
  height: 90vh;
  overflow: hidden;
}

.artwork-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  word-break: break-all;
  overflow-wrap: break-word;
  flex-shrink: 0;
}

.info-inline-section {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.author-source-section {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-shrink: 0;
}

.info-label {
  font-size: 14px;
  font-weight: 600;
  color: hsla(var(--hsl-text), 0.7);
  white-space: nowrap;
  flex-shrink: 0;
}

.info-link {
  display: block;
  text-align: center;
  font-size: 16px;
  border-radius: 10px;
  padding: 8px 12px;
  transition: all 0.2s ease;
  word-wrap: break-word;
  overflow-wrap: break-word;
  text-decoration: none;
  flex: 1;
}

.info-link:hover {
  background-color: rgba(192, 238, 240, 0.5);
  transform: translateY(-1px);
}

.source-url-link {
  background-color: rgba(192, 238, 240, 0.3);
  font-weight: bold;
}

.artwork-artist {
  gap: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(192, 238, 240, 0.2);
}

.artwork-description {
  font-size: 16px;
  line-height: 1.6;
  word-break: break-all;
  overflow-wrap: break-word;
  overflow-y: auto;
  flex: 1;
  padding: 15px;
  margin: 15px 0;
  background-color: rgba(192, 238, 240, 0.1);
  border-radius: 12px;
  border-left: 4px solid rgba(192, 238, 240, 0.6);
  scrollbar-width: thin;
  scrollbar-color: rgba(192, 238, 240, 0.5) transparent;
}

.artwork-description::-webkit-scrollbar {
  width: 6px;
}

.artwork-description::-webkit-scrollbar-track {
  background: rgba(192, 238, 240, 0.1);
  border-radius: 3px;
}

.artwork-description::-webkit-scrollbar-thumb {
  background-color: rgba(192, 238, 240, 0.5);
  border-radius: 3px;
}

.artwork-description::-webkit-scrollbar-thumb:hover {
  background-color: rgba(192, 238, 240, 0.7);
}

.artwork-description.scrollable-content {
  flex: 1;
  min-height: 0;
}

.tags-section {
  margin-bottom: 15px;
  padding: 15px;
  background-color: rgba(192, 238, 240, 0.08);
  border-radius: 12px;
  border: 1px solid rgba(192, 238, 240, 0.2);
  flex-shrink: 0;
}

.tags-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.tags-label {
  font-size: 14px;
  font-weight: 600;
  color: hsla(var(--hsl-text), 0.8);
}

.artwork-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-height: 120px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(192, 238, 240, 0.5) transparent;
}

.artwork-tags::-webkit-scrollbar {
  width: 4px;
}

.artwork-tags::-webkit-scrollbar-track {
  background: transparent;
}

.artwork-tags::-webkit-scrollbar-thumb {
  background-color: rgba(192, 238, 240, 0.5);
  border-radius: 2px;
}

.artwork-action {
  margin-top: 15px;
  border-radius: 12px;
  padding: 15px;
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
  background-color: rgba(192, 238, 240, 0.1);
  flex-shrink: 0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

.similar-title {
  font-size: large;
  margin: 0 16px;
  text-align: center;
  color: hsla(var(--hsl-text), 0.8);
}

@media (max-width: 1000px) {
  .container {
    max-width: 100%;
  }

  .artwork-container {
    flex-direction: column;
  }

  .artwork-pictures,
  .artwork-info {
    max-width: 100%;
  }

  .artwork-info {
    height: auto;
    max-height: 70vh;
  }

  .artwork-description.scrollable-content {
    max-height: 200px;
  }

  .artwork-tags {
    max-height: 80px;
  }

  .artwork-container .picture-card {
    width: 100% !important;
  }

  .info-label {
    font-size: 13px;
  }

  .info-link {
    font-size: 15px;
    padding: 6px 10px;
  }

  .artwork-title {
    font-size: 20px;
    margin-bottom: 15px;
  }

  .artwork-action {
    padding: 12px;
    gap: 10px;
  }

  .author-source-section {
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;
  }

  .artwork-description {
    padding: 12px;
    margin: 12px 0;
  }

  .tags-section {
    padding: 12px;
  }
}

.container {
  min-height: 70vh;
  position: relative;
}

.skeleton-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 10;
  padding: 20px;
}

.v-enter-active,
.v-leave-active {
  opacity: 1;
  transition: all 0.4s linear;
  will-change: opacity;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  will-change: opacity;
}
</style>
