# 小红书赚钱保姆级教程（2026）

> 免费开源的实操学习工作台：先验证用户愿不愿意付钱，再研究如何涨粉。

![开源教程封面](assets/social-preview.png)

**在线教程（GitHub Pages 发布后访问）**：https://aipmandy.github.io/xiaohongshu-income-handbook/  
**GitHub 仓库**：https://github.com/AIPMAndy/xiaohongshu-income-handbook  
**作者**：AI 酋长 Andy ｜ [个人官网](https://metaver.vip/) ｜ [咨询服务](https://metaver.vip/services)

## 项目内容

| 模块 | 内容 |
|---|---|
| 完整课程 | 26 章、78 个可执行步骤，包含完成凭证与遇阻处理 |
| 商业路径 | 7 条变现路径及个人条件匹配工具 |
| 行动计划 | 30 天学习与需求验证任务 |
| 模板工具箱 | 9 份可复用模板 |
| 问题诊断 | 曝光 → 互动 → 线索 → 订单的漏斗诊断 |
| 收益测算 | 收入、成本、工时、退款和平台费的模拟测算 |
| 学习进度 | 浏览器本地保存，支持进度导出与导入 |

## 立即使用

本项目是 **纯静态网站**，无需安装 Node、数据库或付费服务。

1. 下载源码并解压。
2. 直接用浏览器打开 `index.html`（或本地起一个静态服务器）。
3. 进入课程、行动计划和工具箱，按顺序实践。

本地服务器（任选）：

```bash
python3 -m http.server 8080
# 浏览器访问 http://localhost:8080
```

## 文件结构

```text
├── index.html                   # 页面结构、SEO 与所有功能入口
├── assets/
│   ├── style.css                # 苹果风响应式样式
│   ├── data.js                  # 课程、路线、资料与模板内容
│   ├── app.js                   # 路线推荐、搜索、进度、利润等交互
│   ├── social-preview.png       # 社交分享图
│   └── favicon.svg
├── .github/workflows/pages.yml  # 静态检查与 GitHub Pages 自动部署
├── tests/check_project.py       # 自动核验内容与基本资源引用
├── LICENSE                      # MIT
└── README.md
```

## GitHub Pages 部署

1. 在 GitHub 创建公开仓库 `AIPMAndy/xiaohongshu-income-handbook`（不要自动生成 README）。
2. 将本项目完整文件推送到 `main` 分支。
3. 在 `Settings → Pages → Build and deployment → Source` 选择 **GitHub Actions**。
4. GitHub Actions 的 `Pages` 工作流成功后，打开上面的在线教程地址。

也可在已安装并登录 GitHub CLI 的电脑上运行 `bash scripts/publish.sh`，脚本会在仓库不存在时创建公开仓库并推送代码。

## 修改内容与贡献

- 修改课程/路线/模板内容：编辑 `assets/data.js`。
- 修改交互：编辑 `assets/app.js`。
- 修改网站样式：编辑 `assets/style.css`。
- 提交前运行 `python3 tests/check_project.py`。
- 欢迎通过 GitHub Issues 和 Pull Requests 讨论错误、内容改进和可复现实验。

## 重要说明

- 这是独立第三方开源教程，**与小红书官方没有合作或背书关系**。
- **不承诺收益，也不提供规避平台规则、虚假互动或批量灌水方案**。
- 网站计算器展示的是假设情景，结果不代表实际收入；价格、商业合作、税费和平台规定请按最新官方规则核对。
- 进度默认保存在浏览器本地；导出备份由使用者自行保管。
- 内容参考的外部来源按原站列示；第三方标识、链接和原始资料不因本仓库 MIT 许可证而获得再授权。

## License

项目原创代码及原创文档采用 [MIT License](LICENSE) 开源。
