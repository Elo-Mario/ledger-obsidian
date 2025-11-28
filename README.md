# Ledger for Obsidian (账本插件)

在 Obsidian 中轻松管理个人财务和规划！所有数据以纯文本格式存储，与支持 [Ledger CLI](https://www.ledger-cli.org) 的任何工具互操作。不再需要将个人财务信息交给那些出售用户数据的在线网站，而是将其安全地存储在您的 Obsidian 库中。

## 功能特性

- [x] 快捷记账小组件
  - 配合 Obsidian 移动版，随时随地记录支出！
- [x] 自动建议历史账户和支出项目，加速输入
- [x] Obsidian 协议支持，快速启动 Obsidian 并立即记录交易
  - 在移动设备上创建快捷方式链接到 `obsidian://ledger`
- [x] 财务报表功能
  - 可视化图表展示账户余额、盈亏、净资产等
  - 支持日视图、周视图、月视图
  - 交互式图表，支持悬停查看详细信息
- [x] 对账功能
  - 标记交易为已对账状态
  - 快速查看未对账交易
  - 自动更新 Ledger 文件

## 更新日志

### 0.4.5 (2025-11-28)
- **新增对账功能**：
    - 新增"对账交易"命令，可从命令面板快速打开对账界面
    - 在仪表板中添加"对账"按钮，方便进行账户对账
    - 支持批量选择待对账交易并标记为已对账
    - 自动在交易日期后添加 `*` 标记表示已对账
- **新增财务报表功能**：
    - 添加"打开财务报表"按钮，展示详细的财务图表
    - 支持查看账户余额、收支情况、净资产变化趋势
    - 提供日视图、周视图、月视图三种时间维度
    - 图表支持交互式悬停显示详细数据

### 0.4.0 (2025-11-27)
- **界面优化**：
    - 优化图表图例样式（更小尺寸、更好对比度、顶部对齐）
    - 改进图表坐标轴日期格式（针对日/周/月视图的特定格式）
    - 添加可自定义的仪表板标题设置
    - 简化视图选择按钮（日视图/周视图/月视图）
- **图表工具提示**：为图表添加悬停提示，显示详细的日期、账户和数值信息
- **本地化**：完成 UI 元素的中文翻译
- **修复**：修正不同视图的日期范围逻辑，改进图表渲染

![演示](https://raw.githubusercontent.com/tgrosinger/ledger-obsidian/main/resources/screenshots/demo.gif)

## 更多信息

关于 Ledger 的更多信息，请参阅以下资源：

- <https://www.ledger-cli.org>
- <https://plaintextaccounting.org>

## 可用命令

您可以从 Obsidian 命令面板运行以下命令，快速访问 Ledger 插件的功能。

**添加到账本 (Add to Ledger)**

打开一个窗口来输入新交易的详细信息。详细信息将被存储到您在设置中配置的默认 Ledger 文件。

**打开账本仪表板 (Open Ledger dashboard)**

在当前窗口中打开 Ledger 仪表板。仪表板将显示在设置中配置的默认 Ledger 文件中的交易。
您也可以在文件浏览器中点击任何 `.ledger` 文件，在仪表板中查看该文件。

**对账交易 (Reconcile Transactions)**

打开对账界面，显示所有未对账的交易。您可以选择交易并标记为已对账，系统会自动在 Ledger 文件中添加对账标记。

**重置账本教程进度 (Reset Ledger Tutorial progress)**

想再次查看教程？这将重置您的进度，下次打开仪表板时将再次显示教程。

## 截图

![账本仪表板](https://raw.githubusercontent.com/tgrosinger/ledger-obsidian/main/resources/screenshots/ledger-dashboard.png)

![添加交易到账本](https://raw.githubusercontent.com/tgrosinger/ledger-obsidian/main/resources/screenshots/add-to-ledger.png)

![从移动设备添加交易](https://raw.githubusercontent.com/tgrosinger/ledger-obsidian/main/resources/screenshots/mobile-add-expense.png)

## 支持

此插件目前免费提供，但在功能完善后可能会成为付费插件。如果您想表示感谢或帮助支持持续开发，欢迎通过以下方式给予支持：

[![GitHub Sponsors](https://img.shields.io/github/sponsors/tgrosinger?style=social)](https://github.com/sponsors/tgrosinger)
[![Paypal](https://img.shields.io/badge/paypal-tgrosinger-yellow?style=social&logo=paypal)](https://paypal.me/tgrosinger)
[<img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="BuyMeACoffee" width="100">](https://www.buymeacoffee.com/tgrosinger)
