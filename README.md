# 楊子立 | 個人作品集網站

> 網頁設計期末作業 —「用 AI 共創一個完整的網站」
> 主題:個人作品集(深色科技風單頁網站)

一個以 **HTML + CSS + 原生 JavaScript** 製作、具備響應式(RWD)、深淺色雙主題、中英文雙語、數字雨動態背景與多種微互動的個人作品集。

## 特色

- 解碼進場動畫 + 黑幕揭幕轉場
- 四區塊數字雨(Matrix Rain)動態背景
- 深色 / 米黃淺色 一鍵切換(記憶選擇)
- 中文 / English 一鍵切換
- 毛玻璃(Glassmorphism)導覽列與卡片
- 捲動淡入、Hover 光暈、回到頂端、導覽列高亮
- 完整 RWD(手機 375px ～ 電腦 1200px)

## 技術重點

- **Block / Flex / Grid** 三種版面思維皆有運用(詳見 `設計說明.md`)
- CSS 變數建立設計系統(色彩 / 雙主題)
- IntersectionObserver 捲動進場
- Canvas 數字雨動畫

## 檔案結構

```
index.html            網頁結構
style.css             樣式(設計系統 / RWD / 動畫 / 毛玻璃)
script.js             互動邏輯
profile.jpg           個人照片
project-*.jpg/png     專案截圖
設計說明.md           設計說明文件
AI使用紀錄.md         AI 協作紀錄與反思
```

## 部署到 GitHub Pages（讓網站上線）

1. 在 GitHub 建立一個 **Public** 儲存庫。
2. 把本資料夾所有檔案上傳(Add file → Upload files → Commit)。
3. Settings → Pages → Branch 選 `main`、資料夾選 `/ (root)` → Save。
4. 等 1–2 分鐘,即可用 `你的帳號.github.io/儲存庫名` 開啟。

> 首頁檔名為 `index.html`(全小寫),GitHub Pages 會自動當作首頁。

## AI 協作

本作品全程以 Claude 作為協作夥伴(設計發想 + 程式撰寫 / 除錯),所有產出皆經作者理解、判斷與修改。詳見 `AI使用紀錄.md`。

---

© 2026 Yang Zi-Li. All rights reserved. 透過獨立自學與 AI 協作開發
