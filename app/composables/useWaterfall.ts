import { reactive, watchEffect, onActivated, onDeactivated } from 'vue'
import { Snackbar } from '@varlet/ui'
import { useDebounceFn } from '@vueuse/core'
import type { ArtworkListResponse, WaterfallEntry, WaterfallItem } from '~/types/artwork'

// 瀑布流广告位素材, 替换素材时保持 900x1600 并覆盖同名文件
const adAsset = { image: '/ad/900x1600.webp', width: 900, height: 1600 }

const useWaterfall = ({
  artistId,
  tag,
  mode = 'index',
  keyword,
  hybrid,
  similarTarget,
  withAd = false
}: {
  artistId?: string
  tag?: string
  mode?: 'index' | 'random'
  keyword?: string
  hybrid?: boolean
  similarTarget?: string
  withAd?: boolean
}) => {
  const waterfallOption = reactive({
    loading: false,
    bottomDistance: 1000,
    onlyImage: false,
    preloadScreenCount: [1, 1] as [number, number],
    virtual: true,
    gap: useWaterfallGap(),
    enableCache: true,
    itemMinWidth: 320,
    minColumnCount: 2,
    maxColumnCount: 8
  })

  const calcItemHeight = (item: WaterfallEntry, itemWidth: number) => {
    if ('ad' in item) {
      return item.ad.height * (itemWidth / item.ad.width)
    }
    const picture = item.detail.pictures?.[0]
    if (!picture) {
      return 0
    }
    return picture.height * (itemWidth / picture.width)
  }

  const fetchParams = reactive({
    page: 1,
    page_size: 20,
    artist_id: artistId,
    tag: tag,
    r18: usePiniaStore().r18 ? 2 : 0,
    limit: 20,
    // simple: true,
    keyword: keyword,
    hybrid: hybrid,
    similar_target: similarTarget
  })

  const result = reactive({
    list: [] as WaterfallEntry[],
    end: false,
    errorMessage: '',
    statusCode: 200
  })

  // 广告位固定在列表首位, NUXT_PUBLIC_AD_LINK 未配置时不展示
  const adLink = useRuntimeConfig().public.adLink
  if (withAd && adLink) {
    result.list.push({ id: 'waterfall-ad', ad: { ...adAsset, link: adLink } })
  }

  const apiEndpoint = mode === 'random' ? '/artwork/random' : '/artwork/list'

  const { data, status, error } = useAcgapiData<ArtworkListResponse>(apiEndpoint, {
    method: 'GET',
    query: fetchParams,
    onResponse({ response }) {
      result.statusCode = response.status
    }
  })

  watchEffect(() => {
    if (error.value) {
      if (error.value.statusCode === 404 && fetchParams.page !== 1) {
        result.end = true
      } else {
        result.errorMessage = error.value.message
        if (error.value.statusCode === 401) {
          Snackbar.error({
            content: '请登录哦'
          })
        }
      }
    }
  })

  watchEffect(() => {
    if (data.value && data.value.data) {
      for (const artwork of data.value.data) {
        const item: WaterfallItem = {
          id: artwork.id,
          detail: artwork
        }
        result.list.push(item)
      }
      result.end = false
    } else {
      result.end = true
    }
  })

  const checkScrollPosition = () => {
    if (waterfallOption.loading || status.value === 'pending' || result.end) {
      return
    }

    const scrollHeight = document.documentElement.scrollHeight
    const scrollTop = document.documentElement.scrollTop
    const clientHeight = window.innerHeight

    const distanceFromBottom = scrollHeight - scrollTop - clientHeight
    if (distanceFromBottom <= waterfallOption.bottomDistance) {
      waterfallOption.loading = true
      fetchParams.page += 1
      waterfallOption.loading = false
    }
  }

  const scrollHandler = useDebounceFn(checkScrollPosition, 125)

  onActivated(() => {
    window.addEventListener('scroll', scrollHandler)
  })

  onDeactivated(() => {
    window.removeEventListener('scroll', scrollHandler)
  })

  return {
    waterfallOption,
    result,
    calcItemHeight
  }
}

export default useWaterfall
