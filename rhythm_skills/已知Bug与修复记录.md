# 已知 Bug 与修复记录

本文件记录项目历史上出现过的 Bug、根本原因及修复方案，作为今后排查问题的参照。

---

## BUG-001 · 详情页 404（GitHub Pages 静态路由）

**现象**：首页正常，点击歌曲 / 章节 / 艺人详情页后返回 404。

**根本原因**：两层不一致导致：
1. `generateStaticParams` 返回**未编码**的原始 slug（如 `AI - Story`），Next.js 生成目录名也是原始值。
2. 但 Next.js 在渲染时把 URL 中的 `%20` 原样传给 `params.slug`（即 `"AI%20-%20Story"`），导致 `getSongBySlug("AI%20-%20Story")` 找不到文件。

**修复方案**：
- `generateStaticParams` 继续返回未编码 slug（让 GitHub Pages 能正确找到目录）。
- 三个详情页组件在调用数据查询函数前，对 `params` 做 `decodeURIComponent`：

```typescript
// src/app/songs/[slug]/page.tsx
const song = getSongBySlug(decodeURIComponent(slug));

// src/app/chapters/[id]/page.tsx
const chapterId = decodeURIComponent(id);

// src/app/artists/[slug]/page.tsx
const artist = getArtistBySlug(decodeURIComponent(slug));
```

**验证方式**：
```bash
npm run build   # 确认 419 个静态页面全部生成，无 notFound 报错
```
推送后在线上点击包含空格或日文的曲目链接，确认可正常打开。

---

## BUG-002 · Dev 模式下动态路由 Runtime Error

**现象**：`npm run dev` 时点击详情页弹出：
> Page "/songs/[slug]/page" is missing param "/songs/[slug]" in "generateStaticParams()", which is required with "output: export" config.

**根本原因**：`output: 'export'` 在 dev 模式下要求所有动态路由的 param 必须在 `generateStaticParams` 中精确匹配，但 URL 中的编码值（`%20`）与返回的原始值不一致。

**修复方案**：`next.config.ts` 中仅在生产模式启用 `output: 'export'`：

```typescript
const nextConfig: NextConfig = {
  ...(process.env.NODE_ENV === 'production' ? { output: 'export' } : {}),
  images: { unoptimized: true },
  basePath: '/rhyme-dict-web',
  assetPrefix: '/rhyme-dict-web',
};
```

**验证方式**：
- `npm run dev` → 点击任意详情页，无报错，正常渲染。
- `npm run build` → 仍生成完整静态文件，部署不受影响。

---

## BUG-003 · GitHub Pages 样式全部丢失（_next/ 被 Jekyll 拦截）

**现象**：部署后页面无任何样式，浏览器网络面板显示 `_next/static/` 路径下的 CSS/JS 全部 404。

**根本原因**：GitHub Pages 默认启用 Jekyll，会忽略以 `_` 开头的目录，导致 `_next/` 静态资源无法访问。

**修复方案**：在 GitHub Actions 工作流中，上传 artifact 前创建 `.nojekyll` 文件：

```yaml
- run: npm run build
- run: touch out/.nojekyll     # ← 关键行
- uses: actions/upload-pages-artifact@v3
  with:
    path: out
```

**验证方式**：确认 `out/.nojekyll` 文件存在于构建产物中，线上页面有正常视觉样式。

---

## 今后排查 404 的检查清单

1. **本地构建**：`npm run build` 是否报 `notFound` 或生成页面数量减少？
2. **slug 编码**：数据查询函数入参是否都加了 `decodeURIComponent`？
3. **静态资源**：`out/.nojekyll` 是否存在？
4. **basePath**：`next.config.ts` 的 `basePath` 与实际仓库名是否一致？
5. **Actions 日志**：https://github.com/koishi810/rhyme-dict-web/actions 查看构建输出。
