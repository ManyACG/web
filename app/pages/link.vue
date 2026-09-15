<template>
  <div>
    <div class="links-page">
      <div class="header-section">
        <h1 class="page-title">
          <var-icon name="link-variant" size="32" />
          友情链接
        </h1>
        <p class="page-description">
          <!-- 写点什么好呢... -->
        </p>
      </div>

      <div class="links-grid">
        <div
          v-for="link in friendLinks"
          :key="link.link"
          class="link-card var-elevation--3"
          @click="openLink(link.link)"
        >
          <div class="link-content">
            <div class="link-icon">
              <Icon :name="link.icon" size="24" v-if="link.icon" />
              <img
                v-else-if="link.avatar"
                :src="link.avatar"
                :alt="link.name"
                class="avatar-image"
              />
              <var-icon name="bookmark-outline" size="24" v-else />
            </div>
            <div class="link-info">
              <h3 class="link-title" :style="{ color: getThemeColor(link) }">
                {{ link.name }}
              </h3>
              <p class="link-url">{{ formatUrl(link.link) }}</p>
              <p class="link-description">{{ link.desc }}</p>
            </div>
          </div>
          <div class="link-arrow">
            <var-icon name="chevron-right" size="20" />
          </div>
        </div>
      </div>

      <div class="apply-section">
        <var-card>
          <template #title>
            <div class="apply-title">
              <var-icon name="email-outline" size="24" />
              申请友联
            </div>
          </template>
          <div class="apply-content">
            <p>
              我们欢迎相似类型的网站申请友联！如果您的网站内容与二次元、ACG文化相关，
              并且具有一定的内容质量和用户基础，欢迎与我们建立友情链接。
            </p>
            <div class="apply-requirements">
              <h4>申请要求：</h4>
              <ul>
                <li>网站内容健康，符合相关法律法规</li>
                <li>具有一定的原创内容或高质量的内容聚合</li>
                <li>网站运行稳定，用户体验良好</li>
                <li>与 ManyACG 的定位相符合</li>
                <li>上面都是AI编的</li>
              </ul>
            </div>
            <div class="contact-info">
              <var-button type="primary" size="large" @click="openEmail" style="margin-top: 20px">
                <var-icon name="email" style="margin-right: 8px" />
                联系我们：link@manyacg.top
              </var-button>
            </div>
          </div>
        </var-card>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
type Link = {
  link: string
  name: string
  icon?: string
  avatar?: string
  lightColor?: string
  darkColor?: string
  desc?: string
}

const friendLinks: Link[] = [
  {
    link: 'https://t.me/moreacg',
    name: '频道',
    lightColor: '#2c6aa3',
    darkColor: '#7db7ff',
    icon: 'i-line-md:telegram',
    desc: 'ManyACG 官方 Telegram 频道'
  },
  {
    link: 'https://krau.top',
    avatar: 'https://krau.top/photo/avatar/avatar.jpg',
    name: 'Blog',
    lightColor: '#347985',
    darkColor: '#39c5bb',
    desc: '站长的个人博客，技术分享与日常记录'
  },
  {
    link: 'https://www.someacg.top',
    name: 'SomeACG',
    avatar: 'https://www.someacg.top/assets/logo.png',
    lightColor: '#5a4e41',
    darkColor: '#f3dcbd',
    desc: '每日少女壁纸'
  },
  {
    link: 'https://www.moely.link/',
    name: '萌哩',
    avatar: 'https://www.moely.link/assets/img/favicon.png',
    lightColor: '#f724b9',
    darkColor: '#f724b9',
    desc: '全网精选二次元美图，提供高质量原图下载'
  },
  {
    link: 'https://pic.cosine.ren/',
    name: 'Cosine 🎨 Gallery',
    lightColor: '#535177',
    darkColor: '#8a85c5',
    avatar: 'https://pic.cosine.ren/favicon.ico',
    desc: '一个精选的 ACG 图片频道网站，旨在为用户提供高质量的图片资源'
  },
  {
    link: 'https://www.chooiin.com',
    name: '初音导航',
    lightColor: undefined,
    avatar: 'https://www.chooiin.com/favicon.png',
    darkColor: undefined,
    desc: '以初音未来为主题的导航网站'
  }
]

const getThemeColor = (link: Link) => {
  const isLight = usePiniaStore().preferLight
  return isLight ? link.lightColor : link.darkColor
}

const formatUrl = (url: string) => {
  return url.replace(/^https?:\/\//i, '').replace(/\/$/, '')
}

const openLink = (href: string) => {
  window.open(href, '_blank', 'noopener,noreferrer')
}

const openEmail = () => {
  window.location.href = 'mailto:link@manyacg.top'
}

useHead({
  title: '友情链接'
})
</script>

<style scoped>
:root {
  --color-surface: rgba(255, 255, 255, 0.9);
  --color-surface-variant: rgba(255, 255, 255, 0.95);
  --color-text: var(--color-body);
}

[data-theme='dark'] {
  --color-surface: rgba(30, 30, 30, 0.9);
  --color-surface-variant: rgba(45, 45, 45, 0.95);
  --color-text: var(--color-body);
}

.links-page {
  margin: 0 auto;
  padding: 20px;
  max-width: 1200px;
}

.header-section {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 16px;
  color: hsla(var(--hsl-text), 0.9);
}

.page-description {
  font-size: 1.1rem;
  color: hsla(var(--hsl-text), 0.7);
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 50px;
}

.link-card {
  background: var(--color-surface);
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid rgba(192, 238, 240, 0.3);
  color: var(--color-text);
}

.link-card:hover {
  transform: translateY(-4px);
  background: var(--color-surface-variant);
  border-color: rgba(192, 238, 240, 0.6);
}

.link-content {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.link-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(192, 238, 240, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.link-info {
  flex: 1;
}

.link-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.link-url {
  font-size: 0.9rem;
  color: hsla(var(--hsl-text), 0.6);
  margin: 0 0 8px 0;
}

.link-description {
  font-size: 0.9rem;
  color: hsla(var(--hsl-text), 0.7);
  margin: 0;
  line-height: 1.4;
}

.link-arrow {
  color: hsla(var(--hsl-text), 0.4);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.link-card:hover .link-arrow {
  color: hsla(var(--hsl-text), 0.8);
  transform: translateX(4px);
}

.apply-section {
  margin-bottom: 50px;
}

.apply-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.3rem;
  padding: 16px;
  font-weight: 600;
}

.apply-content {
  line-height: 1.6;
  font-size: 1rem;
  color: hsla(var(--hsl-text), 0.8);
}

.apply-requirements {
  margin: 20px 0;
}

.apply-requirements h4 {
  color: hsla(var(--hsl-text), 0.9);
}

.apply-requirements li {
  margin-bottom: 8px;
}

.contact-info {
  text-align: center;
}

.stats-section {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .links-page {
    padding: 16px;
  }

  .page-title {
    font-size: 2rem;
  }

  .links-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .link-card {
    padding: 20px;
  }

  .link-content {
    gap: 12px;
  }

  .link-icon {
    width: 40px;
    height: 40px;
  }
}
</style>
