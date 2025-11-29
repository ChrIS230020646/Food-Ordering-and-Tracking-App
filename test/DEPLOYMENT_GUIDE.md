# 詳細部署指南

## 前置準備

1. **GitHub Repository**
   - 確保你的項目已推送到 GitHub
   - 確保 `.gitignore` 已正確配置（不提交敏感信息）

2. **資料庫準備**
   - 準備好 `Food_Order_3.sql` 文件
   - 或確保資料庫遷移腳本已準備

## 步驟一：部署後端到 Railway

### 1.1 註冊並創建項目

1. 訪問 https://railway.app
2. 使用 GitHub 帳號登錄
3. 點擊 "New Project"
4. 選擇 "Deploy from GitHub repo"
5. 選擇你的 repository

### 1.2 配置後端服務

1. Railway 會自動檢測到項目
2. 點擊項目，選擇 "Settings"
3. 設置 Root Directory 為 `backend`
4. 在 "Variables" 標籤添加環境變數（參考 `env.example`）

### 1.3 添加 MySQL 資料庫

1. 在 Railway 項目中點擊 "+ New"
2. 選擇 "Database" → "Add MySQL"
3. 等待資料庫創建完成
4. 點擊資料庫，在 "Variables" 標籤可以看到連線資訊
5. 將這些資訊填入後端環境變數：
   - `SPRING_DATASOURCE_URL`
   - `SPRING_DATASOURCE_USERNAME`
   - `SPRING_DATASOURCE_PASSWORD`

### 1.4 初始化資料庫

1. 在 Railway 資料庫的 "Connect" 標籤找到連線資訊
2. 使用 MySQL 客戶端（如 MySQL Workbench）連接到資料庫
3. 執行 `Food_Order_3.sql` 初始化資料庫結構

### 1.5 獲取後端 URL

1. 部署完成後，Railway 會提供一個 URL（如：`https://your-app-name.railway.app`）
2. 記下這個 URL，稍後用於前端配置

## 步驟二：部署前端到 Vercel

### 2.1 註冊並導入項目

1. 訪問 https://vercel.com
2. 使用 GitHub 帳號登錄
3. 點擊 "Add New..." → "Project"
4. 選擇你的 repository
5. 點擊 "Import"

### 2.2 配置構建設置

在 "Configure Project" 頁面：

- **Framework Preset**: 選擇 "Vite"
- **Root Directory**: 設置為 `frontend`
- **Build Command**: `npm run build`（自動填充）
- **Output Directory**: `dist`（自動填充）
- **Install Command**: `npm install`（自動填充）

### 2.3 添加環境變數

在 "Environment Variables" 部分添加：

- **Key**: `VITE_API_BASE_URL`
- **Value**: `https://your-backend-name.railway.app/api`（使用步驟 1.5 獲取的 URL）

### 2.4 部署

1. 點擊 "Deploy"
2. 等待構建完成
3. Vercel 會提供一個 URL（如：`https://your-app-name.vercel.app`）

### 2.5 更新後端 CORS 設定

1. 回到 Railway 後端項目
2. 在環境變數中更新 `CORS_ALLOWED_ORIGINS`
3. 值為：`https://your-app-name.vercel.app`（使用步驟 2.4 獲取的 URL）
4. Railway 會自動重新部署

## 步驟三：測試部署

### 3.1 測試後端

1. 訪問 `https://your-backend-name.railway.app/api/health`
2. 應該看到健康檢查響應

### 3.2 測試前端

1. 訪問 Vercel 提供的 URL
2. 嘗試登錄功能
3. 檢查瀏覽器控制台是否有錯誤

## 常見問題

### Q: Railway 構建失敗

**A:** 檢查：
- Java 版本是否為 17
- Maven 構建命令是否正確
- 環境變數是否正確設置

### Q: Vercel 構建失敗

**A:** 檢查：
- Node.js 版本（Vercel 自動檢測）
- 構建命令是否正確
- 依賴是否正確安裝

### Q: CORS 錯誤

**A:** 確保：
- 後端 `CORS_ALLOWED_ORIGINS` 包含前端完整 URL
- 前端 `VITE_API_BASE_URL` 指向正確的後端 URL

### Q: 資料庫連線失敗

**A:** 檢查：
- Railway MySQL 連線資訊是否正確
- 資料庫是否已初始化
- 環境變數中的連線字串格式是否正確

## 後續優化

1. **自定義域名**
   - Railway 和 Vercel 都支持自定義域名
   - 在各自平台的 Settings 中配置

2. **環境變數管理**
   - 使用 Railway 和 Vercel 的環境變數管理功能
   - 為不同環境（開發、生產）設置不同的變數

3. **CI/CD**
   - 兩個平台都支持自動部署
   - 每次推送到 GitHub 主分支會自動觸發部署

4. **監控和日誌**
   - Railway 提供實時日誌查看
   - Vercel 提供構建和運行時日誌



