# Ledger for Obsidian (账本插件)

> **Obsidian 纯文本记账插件**  
> 将财务数据保存在您的仓库中，而不是别人的云端。

[![GitHub release](https://img.shields.io/github/v/release/tgrosinger/ledger-obsidian)](https://github.com/tgrosinger/ledger-obsidian/releases)
[![License](https://img.shields.io/github/license/tgrosinger/ledger-obsidian)](LICENSE)

在 Obsidian 中轻松管理个人财务和规划！所有数据以纯文本格式存储，与支持 [Ledger CLI](https://www.ledger-cli.org) 的任何工具互操作。不再需要将个人财务信息交给那些出售用户数据的在线网站，而是将其安全地存储在您的 Obsidian 库中。

## ✨ 功能特性

### 📊 **财务报表** (v0.4.8 新增)
- **全景流向桑基图**：可视化展示 收入 → 资产 → 支出 的完整资金流
- **资产/负债结构图**：双矩形树图展示您的财务结构
- **趋势分析**：日/月收支趋势和累计结余变化
- **主题自适应**：图表自动适配 Obsidian 的浅色/深色主题

### 💰 **快捷记账小组件**
- 配合 Obsidian 移动版，随时随地记录支出！
- 自动建议历史账户和支出项目，加速输入
- Obsidian 协议支持，快速启动 Obsidian 并立即记录交易
  - 在移动设备上创建快捷方式链接到 `obsidian://ledger`

### ⚖️ **余额修正** (v0.4.8 新增)
- 一键添加余额修正条目
- 自动计算差额
- 消除手工计算错误

### ✅ **流水核对功能**
- 标记交易为已核对状态
- 快速查看未核对流水
- 自动更新 Ledger 文件
- 批量核对支持

![演示](https://raw.githubusercontent.com/tgrosinger/ledger-obsidian/main/resources/screenshots/demo.gif)

## 📥 安装

### 从 Obsidian 社区插件安装
1. 打开 Obsidian 设置 → 社区插件
2. 搜索 "Ledger"
3. 点击安装 → 启用

### 手动安装
1. 从 [GitHub Releases](https://github.com/tgrosinger/ledger-obsidian/releases) 下载最新版本
2. 将 `main.js`、`manifest.json` 解压到 `.obsidian/plugins/ledger-obsidian/`
3. 重新加载 Obsidian 并启用插件

## ⚙️ 配置

### 必需设置
- **启用图表**：必须在插件设置中启用才能查看财务报表
- **设置默认账本文件**：配置主 `.ledger` 文件的路径

### Ledger 文件格式
本插件支持标准 Ledger 格式，增强了中文支持：

```ledger
2025-01-01 * 工资
    Assets:银行:工资卡             ¥10,000.00
    Income:工资                   -¥10,000.00

2025-01-02 超市购物
    Expenses:食品:日用品           ¥123.45
    Assets:银行:工资卡            -¥123.45

2025-01-03 * 餐饮支出
    Expenses:餐饮:午餐             ¥45.00
    Assets:支付宝                 -¥45.00
```

**重要提示：**
- ✅ 完全支持中文账户名
- ✅ 使用 `¥` 符号表示金额（也支持 `$`、`€` 等）
- ✅ 账户名称与金额之间留足空格
- ✅ 日期后使用 `*` 标记表示已核对

## 📖 使用说明

### 可用命令

从 Obsidian 命令面板（Ctrl/Cmd + P）访问以下命令：

**添加到账本**
- 打开表单输入新交易详情
- 交易保存到默认 Ledger 文件

**打开账本仪表板**
- 查看账户余额和交易历史
- 点击任何 `.ledger` 文件在仪表板中打开

**打开财务报表** ⭐ 新增
- 查看可视化图表和分析
- 切换不同时间段（日/周/月）

**余额修正** ⭐ 新增
- 快速添加余额修正条目
- 自动计算差额

**流水核对**
- 查看并标记未核对的交易
- 一键批量核对

**重置教程**
- 重新开始教程演示

## 📸 截图

### 财务报表
_![财务报表](./resources/screenshots/financial-report.png)_
> 全面可视化展示收入、支出和净资产

### 账本仪表板
![账本仪表板](https://raw.githubusercontent.com/tgrosinger/ledger-obsidian/main/resources/screenshots/ledger-dashboard.png)

### 添加交易
![添加交易](https://raw.githubusercontent.com/tgrosinger/ledger-obsidian/main/resources/screenshots/add-to-ledger.png)

### 移动端支持
![移动端](https://raw.githubusercontent.com/tgrosinger/ledger-obsidian/main/resources/screenshots/mobile-add-expense.png)

## 🆕 更新日志

### 0.4.8 (2025-12-03)
- **财务报表系统**：
  - 📊 全景流向桑基图：完整展示资金流（收入 → 资产 → 支出）
  - 🌳 资产/负债双矩形树图：资产结构（绿色）和负债结构（红色）
  - � 趋势分析图：追踪日/月趋势和累计结余
- **余额修正功能**：
  - ⚡ 一键余额修正
  - 🔢 自动计算差额
  - ✏️ 直接更新 Ledger 文件
- **主题适配**：
  - 🌓 无缝浅色/深色模式切换
  - 🎨 主题切换时图表实时更新
  - 👁️ 两种主题下都有高对比度文字

### 0.4.7 (2025-12-02)
- **桑基图重构**：
  - **会计配平**：新增"结余"（盈余）和"存量消耗"（赤字）节点，确保图表左右高度一致
  - **视觉优化**：实现节点和连线按金额降序排列，优化对齐方式和配色方案
  - **Bug修复**：修复了零收入场景下连接丢失的问题
- **修复**：彻底修复了 Moment.js 日期解析警告

### 0.4.6 (2025-12-02)
- **文案优化**：将"对账"相关术语统一更新为"流水核对"，表述更准确
- **代码优化**：清理调试日志，修复 TypeScript 类型错误，提升代码质量

### 0.4.5 (2025-11-28)
- **新增流水核对功能**：
  - 新增"流水核对"命令，可从命令面板快速打开核对界面
  - 在仪表板中添加"流水核对"按钮，方便进行账户核对
  - 支持批量选择待核对流水并标记为已核对
  - 自动在交易日期后添加 `*` 标记表示已核对
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

## 🔧 技术细节

### 技术栈
- **React 17** + **TypeScript**
- **ECharts 6.0** - 图表渲染
- **styled-components** - 样式
- **Nearley** - Ledger 文件解析

### 浏览器兼容性
- 桌面端：✅ Windows、macOS、Linux
- 移动端：✅ iOS、Android（需 Obsidian 移动应用）

## 📚 更多信息

关于 Ledger 的更多信息，请参阅以下资源：

- [Ledger CLI 官方网站](https://www.ledger-cli.org)
- [纯文本记账](https://plaintextaccounting.org)

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

## 📝 许可证

GPL-3.0 License - 详见 [LICENSE](LICENSE) 文件

## 👤 作者

**Tony Grosinger**
- 网站：[grosinger.net](https://grosinger.net)

---

**⭐ 如果您觉得这个插件有帮助，请考虑在 GitHub 上给它一个星标！**