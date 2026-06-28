# Weekly Creator

Obsidian 插件，用于批量创建周记模板文件。

## 功能

- 输入起始日期和周数，一键批量生成周记文件
- 文件命名格式：`YYYY-MM-DD--YYYY-MM-DD.md`
- 自动读取 vault 内的模板文件并替换日期占位符
- 已存在的文件自动跳过，不会覆盖已写内容
- 支持在插件设置中配置默认模板路径和输出目录

## 安装

### 手动安装

1. 从 [Releases](../../releases) 下载最新的 `main.js` 和 `manifest.json`
2. 在 vault 目录下创建 `.obsidian/plugins/weekly-creator/` 文件夹
3. 将两个文件放入该文件夹
4. 在 Obsidian 中进入 **设置 → 第三方插件**，关闭安全模式后启用 **Weekly Creator**

### 本地构建

```powershell
git clone https://github.com/your-username/obsidian-weekly-creator
cd obsidian-weekly-creator
npm install
npm run build
.\deploy.ps1 -VaultPath "C:\path\to\your\vault"
```

## 使用

1. 点击左侧边栏的日历图标，或在命令面板（`Ctrl+P`）中搜索 **批量创建周记文件**
2. 填写起始日期、周数、模板路径
3. 点击**创建**

## 模板格式

模板文件为普通 Markdown 文件，使用以下占位符：

| 占位符 | 替换内容 |
|---|---|
| `{week_start}` | 本周起始日期，格式 `YYYY-MM-DD` |
| `{week_end}` | 本周结束日期，格式 `YYYY-MM-DD` |

示例模板：

```markdown
# {week_start} -- {week_end}

周一

周二

周三

周四

周五

周六

周日

## 健康情况

## 总结
```

## 插件设置

| 设置项 | 说明 | 默认值 |
|---|---|---|
| 默认模板路径 | 相对于 vault 根目录的模板文件路径 | `2026/module/WeekModule.md` |
| 周记输出目录 | 生成文件的保存目录，留空则保存到 vault 根目录 | 空（根目录） |

## 开发

```powershell
npm install
npm run dev      # 监听模式，修改自动重新构建
npm run build    # 生产构建
```
