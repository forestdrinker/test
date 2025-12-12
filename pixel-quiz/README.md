# Pixel Art Quiz Game 🎮

这是一个基于 React + Vite 开发的像素风问答游戏，支持通过 Google Sheets 管理题目并记录成绩。

## 🛠️ 1. 项目安装与运行

1.  **安装依赖**
    在项目根目录打开终端，运行：
    ```bash
    npm install
    ```

2.  **本地开发**
    启动开发服务器：
    ```bash
    npm run dev
    ```
    完成后打开浏览器访问 [http://localhost:5173](http://localhost:5173)。

3.  **环境配置**
    修改根目录下的 `.env` 文件：
    ```env
    VITE_GOOGLE_APP_SCRIPT_URL=你的_GOOGLE_SCRIPT_部署_URL
    VITE_PASS_THRESHOLD=3  # 通过门槛
    VITE_QUESTION_COUNT=5  # 每次游戏题目数
    ```

---

## 📊 2. Google Sheets 设置

1.  创建一个新的 **Google Sheet**。
2.  建立两个工作表（Sheet），分别命名为 **`题目`** 和 **`回答`**。

### 工作表 1：`题目`
**如果不包含标题行，请直接从第1行开始或者修改脚本逻辑。本教程假设第1行为标题行。**
请按照以下列顺序设置标题（A-G列）：
`ID` | `题目` | `A` | `B` | `C` | `D` | `解答`

### 工作表 2：`回答`
设置以下列标题（A-G列）：
`ID` | `闯關次數` | `总分` | `最高分` | `初始通关分` | `通关耗时(次)` | `最近游玩`

---

## 🚀 3. Google Apps Script (GAS) 部署

这是连接前端与 Google Sheets 的桥梁。

1.  在 Google Sheets 中，点击菜单栏的 **扩展程序 (Extensions)** > **Apps Script**。
2.  删除 `Code.gs` 中的默认代码，粘贴以下代码：

```javascript
const SHEET_ID = '你的_GOOGLE_SHEET_ID'; // ★ 可选：如果脚本绑定在Sheet上，可使用 getActiveSpreadsheet()

function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'getQuestions') {
    const count = parseInt(e.parameter.count) || 5;
    return getQuestions(count);
  }
  
  return ContentService.createTextOutput(JSON.stringify({error: 'Invalid action'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const action = e.parameter.action;
  
  if (action === 'submitScore') {
    return submitScore(e.parameter);
  }
  
  return ContentService.createTextOutput(JSON.stringify({error: 'Invalid action'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function getQuestions(n) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('题目');
  // 假设第一行是标题，数据从第二行开始
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return responseJSON([]);
  
  const range = sheet.getRange(2, 1, lastRow - 1, 7); // A-G列
  const values = range.getValues();
  
  // 随机洗牌取 N 题
  const shuffled = values.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, n);
  
  const questions = selected.map(row => ({
    id: row[0],
    question: row[1],
    options: [row[2], row[3], row[4], row[5]],
    answer: row[6]
  }));
  
  return responseJSON(questions);
}

function submitScore(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('回答');
  const userId = data.userId;
  const score = parseInt(data.score);
  const passed = data.passed === 'true';
  const timestamp = new Date();
  
  if (!userId) return responseJSON({error: 'No User ID'});

  const lastRow = sheet.getLastRow();
  let userRowIndex = -1;
  let rowData = [];

  // 简单查找用户是否存在 (数据量大时建议优化)
  if (lastRow > 1) {
    const ids = sheet.getRange(2, 1, lastRow-1, 1).getValues().flat();
    const index = ids.indexOf(userId);
    if (index !== -1) {
      userRowIndex = index + 2; // +2 因为从第2行开始且索引从0起
    }
  }

  if (userRowIndex !== -1) {
    // 更新旧用户
    // 列: ID(1), 闯关次(2), 总分(3), 最高(4), 初始(5), 耗时(6), 时间(7)
    const range = sheet.getRange(userRowIndex, 1, 1, 7);
    const existing = range.getValues()[0];
    
    const attempts = existing[1] + 1;
    const totalScore = existing[2] + score;
    const maxScore = Math.max(existing[3], score);
    const firstClearScore = existing[4] === '' && passed ? score : existing[4]; // 仅第一次通过时记录
    // 简单逻辑：耗时字段这里暂时用来记录尝试次数累加或其他逻辑
    
    sheet.getRange(userRowIndex, 2).setValue(attempts);
    sheet.getRange(userRowIndex, 3).setValue(totalScore);
    sheet.getRange(userRowIndex, 4).setValue(maxScore);
    if (existing[4] === '' && passed) sheet.getRange(userRowIndex, 5).setValue(score);
    sheet.getRange(userRowIndex, 7).setValue(timestamp);
    
  } else {
    // 新用户
    // ID, 1次, 分数, 分数, (通过?分数:''), 1, 时间
    const firstClear = passed ? score : '';
    sheet.appendRow([userId, 1, score, score, firstClear, 1, timestamp]);
  }
  
  return responseJSON({success: true});
}

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3.  **部署**：
    *   点击右上角 **部署 (Deploy)** > **新建部署 (New Deployment)**。
    *   类型选择 **Web 应用 (Web App)**。
    *   **执行身份 (Execute as)**: `我 (Me)`。
    *   **谁可以访问 (Who has access)**: `所有人 (Anyone)` (⚠️ 注意：这允许匿名访问，方便测试)。
    *   点击 **部署**，复制生成的 `Web App URL`。
    *   将此 URL 填入 `.env` 文件的 `VITE_GOOGLE_APP_SCRIPT_URL` 中。

---

## 🚀 5. 自动部署到 GitHub Pages

本项目已配置 **GitHub Actions**，代码推送到 GitHub 后可自动构建并部署。

### 配置步骤：

1.  **上传代码**：将项目推送到您的 GitHub 仓库。
2.  **设置 Secrets (敏感信息)**：
    *   进入仓库页面 -> **Settings** -> **Secrets and variables** -> **Actions**。
    *   点击 **New repository secret**。
    *   Name: `VITE_GOOGLE_APP_SCRIPT_URL`
    *   Value: (填入您的 Google Apps Script 部署 URL)
3.  **设置 Variables (配置参数)**：
    *   切换到 **Variables** 标签页。
    *   点击 **New repository variable**。
    *   Name: `VITE_PASS_THRESHOLD` | Value: `3`
    *   Name: `VITE_QUESTION_COUNT` | Value: `5`
4.  **开启 Pages 权限**：
    *   进入 **Settings** -> **Actions** -> **General**。
    *   向下滚动到 **Workflow permissions**，勾选 **Read and write permissions** 并保存。
5.  **触发部署**：
    *   修改代码并 Push 到 `main` 或 `master` 分支，GitHub Actions 将自动开始构建。
    *   构建完成后，在 **Settings** -> **Pages** 中查看您的网站链接（通常是 `https://您的用户名.github.io/仓库名/`）。

---

## 📝 4. 测试题库 (可以直接复制到 '题目' Sheet)

请将下方数据复制并粘贴到 Google Sheets 的 `题目` 工作表中（从 A2 单元格开始粘贴）：

| ID   | 题目                         | A        | B      | C        | D        | 解答     |
| :--- | :--------------------------- | :------- | :----- | :------- | :------- | :------- |
| 101  | 马里奥的弟弟叫什么名字？     | 瓦里奥   | 路易吉 | 库巴     | 奇诺比奥 | 路易吉   |
| 102  | 著名的吃豆人 ghosts 有几只？ | 3        | 4      | 5        | 2        | 4        |
| 103  | 《塞尔达传说》的主角叫什么？ | 塞尔达   | 林克   | 加农     | 汀格尔   | 林克     |
| 104  | 索尼克原本的设计是什么动物？ | 刺猬     | 犰狳   | 兔子     | 针鼹     | 兔子     |
| 105  | 《我的世界》的创造者是谁？   | 盖茨     | 乔布斯 | Notch    | 宫本茂   | Notch    |
| 106  | 宝可梦图鉴编号 025 是谁？    | 妙蛙种子 | 小火龙 | 杰尼龟   | 皮卡丘   | 皮卡丘   |
| 107  | 街头霸王中会发波动拳的是？   | 春丽     | 隆     | 古烈     | 维加     | 隆       |
| 108  | 俄罗斯方块一共有几种形状？   | 5        | 6      | 7        | 8        | 7        |
| 109  | 下列哪个不是任天堂的主机？   | Wii      | Switch | Genesis  | GameCube | Genesis  |
| 110  | 魂斗罗主角的原型是？         | 施瓦辛格 | 史泰龙 | 尚格云顿 | 李小龙   | 施瓦辛格 |
