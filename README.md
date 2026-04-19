# 进销存管理系统启动指南

## 环境准备

### 必需软件

1. **Node.js** (版本 >= 18.0.0)
   - 下载地址: https://nodejs.org/
   - 安装后验证: `node --version`

2. **Angular CLI** (版本 >= 17.0.0)
   - 安装命令: `npm install -g @angular/cli@17`
   - 验证: `ng version`

3. **Java Development Kit (JDK)** (版本 >= 17)
   - 下载地址: https://adoptium.net/
   - 安装后验证: `java --version`

4. **Maven** (版本 >= 3.8)
   - 下载地址: https://maven.apache.org/download.cgi
   - 验证: `mvn --version`

5. **MySQL** (版本 >= 8.0)
   - 下载地址: https://dev.mysql.com/downloads/
   - 安装时记住 root 密码

### 可选软件

- **MySQL Workbench** 或 **Navicat** (数据库可视化工具)
- **VS Code** 或 **IntelliJ IDEA** (代码编辑器)

---

## 启动步骤

### 第一步：初始化数据库

1. **启动 MySQL 服务**
   - Windows: 在服务中启动 MySQL 服务
   - 或使用命令: `net start mysql`

2. **执行初始化脚本**
   
   方法一：使用 MySQL 命令行
   ```bash
   mysql -u root -p
   ```
   输入密码后，执行:
   ```sql
   source d:/Annan/AI/anotherWay/trae/solo/20260419/ItemManagementSystem/database/init.sql
   ```

   方法二：使用 MySQL Workbench
   - 打开 MySQL Workbench，连接到本地数据库
   - 打开文件 `database/init.sql`
   - 执行整个脚本 (点击闪电图标)

3. **验证数据库**
   ```sql
   USE item_management;
   SHOW TABLES;
   -- 应该看到 product, sale_order, sale_order_item 三个表
   ```

### 第二步：配置数据库连接

后端数据库配置文件位置:
`backend/src/main/resources/application.yml`

默认配置:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/item_management?useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true
    username: root
    password: root
    driver-class-name: com.mysql.cj.jdbc.Driver
```

**重要提示**:
- 如果您的 MySQL root 密码不是 `root`，请修改 `password` 字段
- 确保 MySQL 端口是 3306 (默认端口)

### 第三步：启动后端服务

1. **进入后端目录**
   ```bash
   cd d:\Annan\AI\anotherWay\trae\solo\20260419\ItemManagementSystem\backend
   ```

2. **下载依赖**
   ```bash
   mvn clean install
   ```
   这会下载所有 Spring Boot 依赖包，首次运行可能需要几分钟。

3. **启动后端服务**
   ```bash
   mvn spring-boot:run
   ```

4. **验证后端启动**
   
   看到以下日志表示启动成功:
   ```
   Started ItemManagementSystemApplication in X.XXX seconds
   ```

   访问测试:
   - 浏览器打开: http://localhost:8080/api/products
   - 应该返回 JSON 格式的商品列表数据

### 第四步：启动前端服务

1. **进入前端目录** (新开一个终端窗口)
   ```bash
   cd d:\Annan\AI\anotherWay\trae\solo\20260419\ItemManagementSystem\frontend
   ```

2. **下载依赖**
   ```bash
   npm install
   ```
   首次运行会下载所有 npm 包，可能需要几分钟。

3. **启动前端服务**
   ```bash
   ng serve --open
   ```
   或使用 npm 脚本:
   ```bash
   npm start
   ```

4. **验证前端启动**
   
   服务启动后:
   - 浏览器会自动打开: http://localhost:4200
   - 应该看到进销存管理系统的首页

---

## 功能验证

### 1. 商品管理功能

**测试步骤:**
1. 点击左侧导航栏的「商品管理」
2. 点击「新增商品」按钮
3. 填写商品信息:
   - 商品名称: 测试商品
   - 商品编码: TEST001
   - 分类: 测试
   - 单位: 个
   - 进货价: 10.00
   - 销售价: 18.00
   - 初始库存: 50
   - 最低库存预警: 10
4. 点击「添加」按钮
5. 验证: 列表中应该显示新增的商品

**预期结果:**
- 商品成功添加到列表
- 可以编辑和删除商品
- 可以搜索商品名称

### 2. 销售开单功能

**测试步骤:**
1. 点击左侧导航栏的「销售开单」
2. 在「选择商品」下拉框中选择一个商品
3. 输入数量 (如: 2)
4. 点击「添加」按钮
5. (可选) 继续添加其他商品
6. 填写客户信息 (可选)
7. 点击「确认开单」按钮

**预期结果:**
- 订单创建成功
- 商品库存自动减少
- 「最近订单」列表显示新增订单

### 3. 库存查询与预警功能

**测试步骤:**
1. 点击左侧导航栏的「库存查询」
2. 查看「库存状态」列
3. 点击「仅显示库存不足」按钮
4. 对库存不足的商品点击「补货」按钮
5. 输入补货数量，点击「确认补货」

**预期结果:**
- 库存充足的商品显示「库存充足」(绿色)
- 库存不足的商品显示「库存不足」(橙色/红色)
- 侧边栏「库存查询」有红色角标显示预警数量
- 补货后库存数量增加

### 4. 首页仪表盘

**测试步骤:**
1. 点击左侧导航栏的「首页」
2. 查看统计卡片:
   - 商品总数
   - 库存预警
   - 今日订单
   - 今日营收
3. 查看快捷操作按钮
4. 查看库存预警提醒
5. 查看最近订单

**预期结果:**
- 统计数据正确显示
- 点击统计卡片可跳转到对应页面
- 快捷操作按钮可以点击

---

## 常见问题

### Q1: 后端启动失败，提示连接数据库错误

**可能原因:**
1. MySQL 服务未启动
2. 数据库密码错误
3. 数据库未创建

**解决方案:**
1. 确认 MySQL 服务已启动
2. 检查 `application.yml` 中的密码配置
3. 确认已执行 `init.sql` 脚本

### Q2: 前端启动失败，提示依赖缺失

**解决方案:**
1. 删除 `node_modules` 文件夹
2. 重新执行 `npm install`
3. 确保 Node.js 版本 >= 18

### Q3: 前后端无法通信

**可能原因:**
- CORS 跨域问题

**解决方案:**
- 确认后端已启动在 8080 端口
- 确认前端启动在 4200 端口
- 后端控制器已添加 `@CrossOrigin(origins = "http://localhost:4200")`

### Q4: 如何修改端口配置

**修改后端端口:**
编辑 `application.yml`:
```yaml
server:
  port: 8081  # 改为你想要的端口
```

**修改前端端口:**
编辑 `angular.json` 或启动时指定:
```bash
ng serve --port 4201
```

### Q5: 如何打包部署

**后端打包:**
```bash
cd backend
mvn clean package
java -jar target/item-management-system-1.0.0.jar
```

**前端打包:**
```bash
cd frontend
ng build --configuration production
```
打包后的文件在 `dist/` 目录下，可以部署到 Nginx 等 Web 服务器。

---

## 项目结构说明

```
ItemManagementSystem/
├── backend/                    # 后端 Spring Boot 项目
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/ims/
│   │   │   │   ├── controller/      # REST API 控制器
│   │   │   │   ├── dto/             # 数据传输对象
│   │   │   │   ├── entity/          # 数据库实体
│   │   │   │   ├── exception/       # 异常处理
│   │   │   │   ├── repository/      # 数据访问层
│   │   │   │   └── service/         # 业务逻辑层
│   │   │   └── resources/
│   │   │       └── application.yml  # 应用配置
│   └── pom.xml
│
├── frontend/                   # 前端 Angular 项目
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/            # 核心模块
│   │   │   │   ├── models/      # 数据模型
│   │   │   │   └── services/    # API 服务
│   │   │   ├── home/            # 首页组件
│   │   │   ├── inventory/       # 库存查询组件
│   │   │   ├── order/           # 销售开单组件
│   │   │   └── product/         # 商品管理组件
│   │   └── styles.scss          # 全局样式
│   ├── angular.json
│   └── package.json
│
├── database/                    # 数据库脚本
│   └── init.sql
│
└── README.md
```

---

## 技术栈说明

### 后端技术栈
- **Spring Boot 3.2** - 应用框架
- **Spring Data JPA** - 数据访问
- **MySQL 8.0** - 数据库
- **Lombok** - 简化 Java 代码
- **Maven** - 项目构建

### 前端技术栈
- **Angular 17** - 前端框架
- **Angular Material** - UI 组件库
- **TypeScript** - 类型安全的 JavaScript
- **RxJS** - 响应式编程
- **SCSS** - CSS 预处理器

### 设计特点
- **玫瑰红色主题** - 避免蓝色系，使用暖色调
- **简洁清爽** - 无复杂装饰，注重实用性
- **响应式布局** - 适配不同屏幕尺寸
- **交互友好** - 即时反馈，操作简单

---

## 联系支持

如有问题，请检查以下几点：
1. 所有必需软件已正确安装
2. 数据库已按步骤初始化
3. 配置文件中的密码设置正确
4. 前后端服务都已启动

如需查看详细日志：
- 后端日志: 终端输出
- 前端日志: 浏览器开发者工具 (F12) -> Console