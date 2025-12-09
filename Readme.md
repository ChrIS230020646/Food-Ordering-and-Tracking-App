## backend/controller/*
  用api去call到frontend
You need to start the backend first, then start the frontend.

backend：
open cmd
cd to yourpath\\backend
**copy this and run:** mvnw.cmd spring-boot:run



frontend：
open **new** cmd
cd to yourpath\\frontend
**copy this and run:** npm install
                       npm run dev

OR you can
cd to yourpath
**copy this and run:** npm run install:all
                       npm run dev
                       
for macOS  you need authorization：
cd backend
chmod +x mvnw
