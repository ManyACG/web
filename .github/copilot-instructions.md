# ManyACG Web – AI 开发说明

## 项目概览
- 技术栈：Nuxt 4 + TypeScript，UI 主要使用 Varlet（`@varlet/ui`）+ 虚拟瀑布流（`@lhlyu/vue-virtual-waterfall`），部分细节用 Element Plus（如 `ElImageViewer`）。
- 路由/页面：使用 Nuxt 约定式路由，页面位于 `app/pages`，全局布局在 `app/layouts/default.vue`，入口在 `app/app.vue`。
- 状态管理：使用 Pinia（`@pinia/nuxt`），全局 store 在 `app/stores/store.ts`，并通过 `pinia-plugin-persistedstate` 持久化到 `localStorage`。
- 接口访问：通过 `nuxt-api-party` 配置的 `acgapi` 端点，对外暴露组合式函数 `useAcgapiData` 和 `$acgapi`（见多处使用），后端基址由环境变量 `API_BASE` 提供。

## 运行与环境
- Node 版本：24，包管理工具：pnpm（见根目录 `README.md`）。
- 开发：在仓库根目录执行：`pnpm i` → `pnpm dev`。
- 构建与生产：`pnpm build`，Node 直接运行 `.output/server/index.mjs`。
- 环境变量：参考 `.env.example`，至少需要 `API_BASE`、`CLIENT_MODE` 等，`nuxt.config.ts` 中使用 `runtimeConfig` 和 `routeRules` 进行 API 代理/重定向。

## 关键结构与模式
- 瀑布流数据流：
  - 瀑布流逻辑集中在 `app/composables/useWaterfall.ts`，负责：分页参数（`fetchParams`）、结果状态（`result`）、错误处理、滚动触底加载等。
  - 使用 `useAcgapiData<ArtworkListResponse>(apiEndpoint, { query: fetchParams, ... })` 拉取数据，并将 `Artwork` 封装为 `WaterfallItem` 后推入 `result.list`。
  - UI 层通过 `VirtualWaterfall` 组件渲染（插件在 `app/plugins/waterfall.ts` 注册），典型用法见 `app/components/WaterfallContent.vue` 与 `app/pages/search/result.vue`。
  - 新建列表页或搜索结果页时，应优先复用 `useWaterfall`，通过参数控制 `artistId`、`tag`、`keyword`、`similarTarget` 等，而不是自行实现无限滚动。

- 作品详情与缓存：
  - 全局作品缓存 store：`useArtworkStore` 在 `app/stores/store.ts` 中，内部维护 `Record<string, Artwork>` 并在超出 `maxCacheSize` 时清空。
  - 列表卡片组件 `app/components/WaterfallCard.vue` 在点击时会：
    - 调用 `useArtworkStore().addArtwork(item.detail)` 把完整 `Artwork` 缓存起来；
    - 然后 `navigateTo({ path: "/artwork/${item.id}" })` 进入详情页。
  - 详情页 `app/pages/artwork/[id].vue` 首先从 `useArtworkStore().getArtwork(artworkId)` 读取缓存；若不存在，再使用 `$acgapi<ArtworkDetailResponse>(
    "/artwork/${artworkId}"
  )` 拉取并赋值。
  - 在此基础上实现新详情相关功能时，应：
    - 先尝试从 `useArtworkStore` 读取，避免重复请求；
    - 若需额外字段，扩展 `app/types/artwork.ts` 中对应接口类型。

- 下载与文件相关 API 调用：
  - 作品详情页封装了下载逻辑：
    - 单图：`$acgapi<Blob>("/picture/file/${picture.id}")` → `file-saver` 的 `saveAs` 直接保存。
    - 多图：使用 `@zip.js/zip.js` + `tiny-async-pool` 并发下载，再打包成 zip 保存。
  - 通用错误处理集中在 `handleApiError`，会根据响应状态抛出带文案的 `Error`；调用方统一用 Varlet `Snackbar` 做用户提示。
  - 如需新增下载入口或批量操作，建议复用这一模式（Blob + `$acgapi` + 错误统一处理 + Snackbar 提示）。

- 搜索与相似推荐：
  - 搜索结果页 `app/pages/search/result.vue`：
    - 从 `route.query` 读取 `q`（关键字）、`hybrid` 和 `similar_target`，并将这些参数传给 `useWaterfall`。
    - 当查询条件变化时目前通过 `watch` 直接 `location.reload()`，后续如要优化，应重构为重置 `result` 和分页参数而非整页刷新。
  - 推荐区域复用瀑布流：`app/pages/artwork/[id].vue` 底部的“相关推荐”区域通过 `useWaterfall({ similarTarget: artworkId })` 获取相似作品。

## UI、主题与布局约定
- 全局布局：
  - 顶部导航和侧边菜单在 `app/layouts/default.vue` 中，使用 `var-app-bar` 与 `var-popup` 实现。
  - 布局中包含全局搜索弹窗 `SearchDialog`、R18 开关、主题切换以及 RSS 链接等；新增全局入口请优先在此布局中扩展菜单项数组 `menuItems`。

- 主题切换与 Varlet StyleProvider：
  - 主题变量定义在 `app/utils/theme.ts` 中的 `lightTheme` / `darkTheme`，基于 Varlet 的 MD3 主题扩展，使用自定义 HSL 变量（如 `--hsl-primary`、`--hsl-body` 等）。
  - 插件 `app/plugins/varlet.ts` 在客户端启动时根据 `usePiniaStore().preferLight` 决定调用 `StyleProvider(lightTheme)` 或 `StyleProvider(darkTheme)`。
  - 布局中的 `handleChangeTheme` 会切换 `preferLight` 并立即调用 `StyleProvider` 更新主题；如需新增颜色/语义变量，请修改 `theme.ts` 并优先复用 HSL 变量。

- R18 开关与地区判断：
  - R18 状态位于全局 store `usePiniaStore().r18`，对瀑布流 API 的影响体现在 `useWaterfall` 中的 `r18: usePiniaStore().r18 ? 2 : 0` 查询参数。
  - `default.vue` 中通过 `$acgapi<MyIPResponse>("/myip")` 判断用户是否在中国境外，仅对非中国用户展示 R18 菜单项，并在国内用户自动关闭 R18。
  - 新增与内容级别相关逻辑时，要注意与 `r18` 标志保持一致，并复用这一判断模式。

- SEO 与社交分享：
  - 基础 meta 信息在 `app/app.vue` 中通过 `useHead` / `useSeoMeta` 设置，包括标题、描述和 Open Graph / Twitter 卡片默认配置。
  - 各页面/详情通常会以 `useHead` + `useSeoMeta` 覆盖标题与图片，例如 `app/pages/artwork/[id].vue` 根据作品与 R18 状态设定 `ogImage`，必要时通过 `https://wsrv.unv.app/` 转换 avif 为 jpg。
  - 新增页面时，请遵循这种模式：
    - 用 `useHead` 设置简单 title；
    - 用 `useSeoMeta` 设置 `ogTitle` / `description` / `twitter*` 字段，以 `ManyACG` 结尾保持统一。

## 其他约定
- 类型定义：所有与作品/作者/标签相关的接口类型集中在 `app/types/artwork.ts`，扩展 API 返回字段时优先修改这里，并在 store 与页面中统一使用。
- 工具/辅助：日期、路由返回等通用逻辑在 `app/utils` 中（如 `router-back.ts`），新增通用功能时放入此目录，页面中只引用工具接口。
- 旧代码：`backup/deprecated` 下为旧组件/页面，仅作为参考，不要在新功能中继续依赖。
