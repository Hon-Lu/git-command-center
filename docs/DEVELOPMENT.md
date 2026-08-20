# 開發說明

Git 指令中心的架構與擴充方式。使用說明請見 [README](../README.md)。

## 專案結構

```text
index.html                 首頁與搜尋
command.html               所有指令共用的內容頁外殼
assets/css/                設計 token、元件與頁面樣式
assets/js/                 共用互動、首頁與路由邏輯
data/command-index.js      首頁清單與搜尋 metadata
commands/*.js              每個 Git 指令的獨立內容模組
docs/git-common-commands.md 原始筆記
```

這個結構避免把所有內容硬塞進同一份 HTML。`command.html` 只負責共用版型，實際工具各自放在 `commands/`。

## 新增一個 Git 指令

### 1. 建立獨立模組

複製：

```text
commands/_template.js
```

改名成例如：

```text
commands/cherry-pick.js
```

把檔案中的 `id`、章節與 `render()` 內容換成新工具。

### 2. 加到首頁索引

在 `data/command-index.js` 增加一筆：

```js
{
  id: 'cherry-pick',
  script: 'commands/cherry-pick.js',
  title: 'cherry-pick',
  label: '把指定 commit 搬到目前分支',
  description: '輸入 commit hash 後產生指令。',
  category: 'commit',
  categoryLabel: 'Commit',
  icon: 'branch',
  accent: 'blue',
  tags: ['互動產生器'],
  keywords: ['cherry-pick', 'commit', 'hash']
}
```

完成後重新開啟 `index.html` 即可，不需要 build。

## 設計方向

介面參考 Emil Kowalski 的 `apple-design` skill，採用：

- 即時的按壓與複製回饋
- 半透明浮動導覽與清楚的深度層級
- 系統字體、尺寸對應的字距與行高
- 清楚的路徑、具體標籤與 inline validation
- 深色模式、`prefers-reduced-motion`、`prefers-reduced-transparency` 與高對比支援

參考來源：`https://github.com/emilkowalski/skills/tree/main/skills/apple-design`
