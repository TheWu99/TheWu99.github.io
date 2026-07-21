# 《道德经》私人阅读器

此目录是部署在 `TheWu99.github.io` 上的静态阅读器。页面源代码可以公开查看，但不会把《道德经》正文、GitHub 令牌或私人仓库数据写入 Pages 仓库。

## 安全模型

1. `TheWu99.github.io` 是个人 GitHub Pages，站点本身公开。
2. 阅读器要求用户在浏览器中提供 Fine-grained Personal Access Token。
3. 页面调用 GitHub REST API 验证令牌所属用户必须是 `TheWu99`。
4. 页面再次验证 `ChatGPT-Knowledge-Base` 仍是私人仓库。
5. 令牌应只授权该仓库的 `Contents: Read-only` 权限。
6. 默认只保存在 JavaScript 内存；用户明确勾选后才保存到当前标签页的 `sessionStorage`。
7. 页面 CSP 只允许连接 `https://api.github.com`，不加载第三方脚本或字体。
8. 点击“锁定”会清除页面内令牌和已加载正文。

## 内容来源

- 仓库：`TheWu99/ChatGPT-Knowledge-Base`
- 目录：`Philosophy/Chinese-Philosophy/Dao-De-Jing/`
- 章节清单：`chapters.json`

## GitHub Pages 的限制

个人账户的 GitHub Pages 不能原生设置成“仅仓库所有者可访问”。GitHub 的私有 Pages 访问控制仅适用于 GitHub Enterprise Cloud 组织中的私人或内部项目站点。因此，本阅读器保护的是私人正文，不是假装公开 Pages URL 本身是私人页面。
