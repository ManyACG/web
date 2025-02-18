import { reactive, h, onMounted, onUnmounted, watchEffect } from "vue";
import { render } from "vue";
import WaterfallCard from "@/components/WaterfallCard.vue";
import { Snackbar } from "@varlet/ui";
import { useDebounceFn } from "@vueuse/core";
import { useWaterfallGap } from "@/composables/useWaterfallGap";
import type { ArtworkListResponse } from "~/typing/artwork";

function getRealHeight(item: WaterfallItem, realWidth: number) {
  if (typeof window === "undefined") {
    return 0;
  }
  const container = document.createElement("div");
  render(
    h(WaterfallCard, {
      item: item,
      width: realWidth + "px",
      noImage: true,
    }),
    container
  );
  document.body.appendChild(container);
  const height: number = container.firstElementChild?.clientHeight ?? 0;
  document.body.removeChild(container);
  return height;
}

const useWaterfall = ({
  artistId,
  tag,
  mode = "index",
  keyword,
  hybrid,
  similarTarget,
}: {
  artistId?: string;
  tag?: string;
  mode?: "index" | "random";
  keyword?: string;
  hybrid?: boolean;
  similarTarget?: string;
}) => {
  const waterfallOption = reactive({
    loading: false,
    bottomDistance: 1000,
    onlyImage: false,
    preloadScreenCount: [1, 3] as [number, number],
    virtual: true,
    gap: useWaterfallGap(),
    itemMinWidth: 300,
    minColumnCount: 2,
    maxColumnCount: 7,
  });

  const calcItemHeight = (item: WaterfallItem, itemWidth: number) => {
    let extraHeight = 0;
    if (!waterfallOption.onlyImage && typeof window !== "undefined") {
      extraHeight = getRealHeight(item, itemWidth);
    }
    return item.height * (itemWidth / item.width) + extraHeight;
  };

  const fetchParams = reactive({
    page: 1,
    page_size: 30,
    artist_id: artistId,
    tag: tag,
    r18: usePiniaStore().r18 ? 2 : 0,
    limit: 30,
    simple: true,
    keyword: keyword,
    hybrid: hybrid,
    similar_target: similarTarget,
  });

  const result = reactive({
    list: [] as WaterfallItem[],
    end: false,
    errorMessage: "",
    statusCode: 200,
  });

  const apiEndpoint = mode === "random" ? "/artwork/random" : "/artwork/list";

  const { data, status, error } = useAcgapiData<ArtworkListResponse>(apiEndpoint, {
    method: "GET",
    query: fetchParams,
    onResponse({ response }) {
      result.statusCode = response.status;
    },
  });

  watchEffect(() => {
    if (error.value) {
      if (error.value.statusCode === 404 && fetchParams.page !== 1) {
        result.end = true;
      } else {
        result.errorMessage = error.value.message;
        if (error.value.statusCode === 401) {
          Snackbar.error({
            content: "请登录哦",
          });
        }
      }
    }
  });

  watchEffect(() => {
    if (data.value && data.value.data) {
      for (const artwork of data.value.data) {
        const item: WaterfallItem = {
          id: artwork.id,
          title: artwork.title,
          source_url: artwork.source_url,
          artist_name: artwork.artist.name,
          width: artwork.pictures[0].width,
          height: artwork.pictures[0].height,
          thumbnail: artwork.pictures[0].thumbnail,
          regular: artwork.pictures[0].regular,
        };
        result.list.push(item);
      }
      result.end = false;
    } else {
      result.end = true;
    }
  });

  const checkScrollPosition = () => {
    if (waterfallOption.loading || status.value === "pending" || result.end) {
      return;
    }

    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = document.documentElement.scrollTop;
    const clientHeight = window.innerHeight;

    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    if (distanceFromBottom <= waterfallOption.bottomDistance) {
      waterfallOption.loading = true;
      fetchParams.page += 1;
      waterfallOption.loading = false;
    }
  };

  const scrollHandler = useDebounceFn(checkScrollPosition, 125);

  onMounted(() => {
    window.addEventListener("scroll", scrollHandler);
  });

  onUnmounted(() => {
    window.removeEventListener("scroll", scrollHandler);
  });

  return {
    waterfallOption,
    result,
    calcItemHeight,
  };
};

export default useWaterfall;
