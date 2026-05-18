# rhythm_skills

韻辞典 Web 项目的 Claude Code 技能库。在项目目录下用 `/技能名` 调用。

| 技能 | 用途 |
|------|------|
| [新增曲目](新增曲目.md) | 向语料库添加一首新歌 |
| [同步数据](同步数据.md) | 从 Obsidian vault 同步最新 .md 文件到 data/ |
| [部署](部署.md) | 构建并推送到 GitHub Pages |
| [韻统计报告](韻统计报告.md) | 生成语料库当前状态的统计摘要 |
| [查找相似曲目](查找相似曲目.md) | 根据母音骨格或章分类找相似曲目 |
| [检查数据质量](检查数据质量.md) | 扫描数据文件，找出缺失或格式问题 |

## 使用方法

在 Claude Code 中，确保工作目录为项目根目录，然后输入 `/技能名` 即可触发对应技能。
例如：`/新增曲目`、`/同步数据`

若要让 Claude Code 识别本目录为命令目录，在 `.claude/settings.json` 中添加：
```json
{
  "commandsDirectory": "rhythm_skills"
}
```
