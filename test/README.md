# 雲端部署測試配置

本文件夾包含用於測試雲端部署的配置文件，不會影響現有項目文件。

## 部署方案：Vercel (前端) + Railway (後端)

### 部署步驟

#### 1. 後端部署到 Railway

1. 註冊 Railway 帳號：https://railway.app
2. 創建新專案，選擇 "Deploy from GitHub repo"
3. 連接你的 GitHub repository
4. 選擇 `backend` 文件夾作為根目錄
5. Railway 會自動檢測到 Maven 項目並開始構建
6. 添加環境變數（見下方環境變數配置）
7. 添加 MySQL 資料庫服務（Railway 提供免費 MySQL）

#### 2. 前端部署到 Vercel

1. 註冊 Vercel 帳號：https://vercel.com
2. 導入你的 GitHub repository
3. 設置：
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. 添加環境變數（見下方環境變數配置）

#### 3. 環境變數配置

**Railway (後端) 環境變數：**
```
SPRING_DATASOURCE_URL=jdbc:mysql://[railway-mysql-host]:3306/[database-name]?useSSL=true&serverTimezone=Asia/Hong_Kong
SPRING_DATASOURCE_USERNAME=[mysql-username]
SPRING_DATASOURCE_PASSWORD=[mysql-password]
SECURITY_JWT_SECRET=[your-long-random-secret-key-at-least-32-chars]
SECURITY_JWT_EXPIRATION_MINUTES=60
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
```

**Vercel (前端) 環境變數：**
```
VITE_API_BASE_URL=https://your-backend-domain.railway.app/api
```

### 文件說明

- `railway.json` - Railway 部署配置
- `vercel.json` - Vercel 部署配置
- `render.yaml` - Render 替代方案配置（如果不想用 Railway）
- `env.example` - 環境變數示例文件
- `backend/application.properties.production` - 生產環境配置模板
- `frontend/vite.config.production.ts` - 生產環境 Vite 配置模板

### 注意事項

1. 這些配置文件僅供參考，實際部署時需要根據你的實際域名調整
2. 確保資料庫已正確遷移（可以使用 `Food_Order_3.sql`）
3. JWT Secret 必須是至少 32 字符的隨機字符串
4. CORS 設定必須包含前端實際部署的域名



