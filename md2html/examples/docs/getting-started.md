# 快速开始

欢迎使用 md2html-cli！这是一个简单易用的 Markdown 转 HTML 命令行工具。

## 安装

在开始使用之前，您需要先安装 md2html-cli。

### 前置要求

- Node.js (版本 14 或更高)
- npm (Node Package Manager)

您可以通过以下命令检查是否已安装 Node.js 和 npm：

```bash
node --version
npm --version
```

### 全局安装

推荐使用全局安装，这样您就可以在任何目录下使用 md2html 命令：

```bash
npm install -g md2html-cli
```

### 本地安装

如果您希望只在当前项目中使用 md2html-cli，可以选择本地安装：

```bash
npm install md2html-cli --save-dev
```

本地安装后，您可以通过以下方式使用：

```bash
npx md2html input.md
```

或者将其添加到项目的 `package.json` 脚本中：

```json
{
  "scripts": {
    "build:docs": "md2html docs/ -o docs-html/"
  }
}
```

然后运行：

```bash
npm run build:docs
```

## 基本使用

安装完成后，您就可以开始使用 md2html-cli 了。

### 转换单个文件

最简单的用法是转换单个 Markdown 文件：

```bash
md2html input.md
```

这会将 `input.md` 文件转换为 HTML，并保存到默认的 `./dist` 目录中，生成的文件名为 `input.html`。

### 查看转换结果

转换完成后，您可以在浏览器中打开生成的 HTML 文件来查看结果：

```bash
# macOS
open dist/input.html

# Linux
xdg-open dist/input.html

# Windows
start dist/input.html
```

### 转换目录

md2html-cli 还支持转换整个目录及其子目录下的所有 Markdown 文件：

```bash
md2html docs/
```

这会将 `docs/` 目录下的所有 `.md` 文件转换为 HTML，并保存到默认的 `./dist` 目录中，保持原有的目录结构。

## 下一步

现在您已经掌握了 md2html-cli 的基本用法。接下来，您可以：

1. **学习高级用法**: 查看 [高级用法](advanced.md) 文档，了解如何指定输出目录、使用自定义 CSS、启用监听模式等。
2. **探索配置选项**: 查看 [配置选项](configuration.md) 文档，了解所有可用的命令行参数和配置选项。
3. **查看示例**: 查看 [示例](examples.md) 文档，了解更多实际使用场景和示例代码。

如果您在使用过程中遇到任何问题或有任何建议，请随时查看 [常见问题](faq.md) 文档或提交 Issue。

祝您使用愉快！
