# ManyACG Web

ManyACG 的前端代码

https://manyacg.top

## 技术栈

Framework: [Nuxt4](https://nuxt.com/)

UI: [Varlet](https://varletjs.org)

## 开发

包管理: [pnpm](https://pnpm.io/)

Node Version: 24

进入项目目录, 安装依赖

```bash
pnpm i
```

创建 `.env` 文件, 参照 `.env.example` 填写配置

启动开发环境

```bash
pnpm dev
```

## 部署
### Vercel

Fork 本仓库, 在 Vercel 中导入项目, 参考 `.env.example` 配置环境变量, Deploy

### Node

参考 `.env.example` , 在项目目录下创建 `.env` 文件, 填写配置

```bash
pnpm build
node .output/server/index.mjs
```