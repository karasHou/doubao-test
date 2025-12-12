# 高级用法

在掌握了基本用法之后，让我们来探索一下 md2html-cli 的高级功能。

## 指定输出目录

默认情况下，转换后的 HTML 文件会保存在 `./dist` 目录中。您可以使用 `-o` 或 `--output` 参数指定自定义输出目录：

```bash
# 将单个文件转换到指定目录
md2html input.md -o ../html-output/

# 将目录转换到指定目录
md2html docs/ --output docs-html/
```

如果指定的输出目录不存在，md2html-cli 会自动创建它。

## 使用自定义 CSS

md2html-cli 提供了默认的 CSS 样式，但您可以通过 `-s` 或 `--style` 参数添加自定义 CSS 文件，来定制输出 HTML 的样式：

```bash
# 使用单个自定义 CSS 文件
md2html input.md -s custom.css

# 使用多个自定义 CSS 文件（用逗号分隔）
md2html input.md --style custom1.css,custom2.css

# 转换目录时使用自定义 CSS
md2html docs/ -s styles/main.css -o docs-html/
```

### 自定义 CSS 示例

以下是一个简单的自定义 CSS 示例，用于修改页面的主色调和链接样式：

```css
/* custom.css */

/* 修改页面背景色 */
body {
    background-color: #f8f9fa;
}

/* 修改容器最大宽度 */
.container {
    max-width: 1000px;
}

/* 修改主色调 */
:root {
    --primary-color: #2c3e50;
    --secondary-color: #3498db;
    --accent-color: #e74c3c;
}

/* 修改标题样式 */
.header h1 {
    color: var(--primary-color);
    font-size: 2.5rem;
    margin-bottom: 15px;
}

/* 修改链接样式 */
.content a {
    color: var(--secondary-color);
    border-bottom-color: var(--secondary-color);
    text-decoration: none;
}

.content a:hover {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
}

/* 修改代码块样式 */
.content pre {
    background-color: #2d2d2d;
    border-color: #3d3d3d;
    border-radius: 6px;
    padding: 18px;
}

.content code {
    background-color: #f1f3f4;
    color: var(--accent-color);
    padding: 2px 6px;
    border-radius: 3px;
}

.content pre code {
    background-color: transparent;
    color: #ccc;
}

/* 修改引用样式 */
.content blockquote {
    border-left-color: var(--secondary-color);
    background-color: #e3f2fd;
    padding: 15px 20px;
    border-radius: 4px;
    color: #1565c0;
}

/* 修改表格样式 */
.content table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 20px;
}

.content th,
.content td {
    border: 1px solid #ddd;
    padding: 12px;
    text-align: left;
}

.content th {
    background-color: #f5f5f5;
    font-weight: 600;
}

.content tr:nth-child(even) {
    background-color: #fafafa;
}

.content tr:hover {
    background-color: #f5f5f5;
}
```

## 监听模式

md2html-cli 支持监听模式，当文件发生变化时会自动重新转换。这对于开发文档时非常有用。

要启用监听模式，使用 `-w` 或 `--watch` 参数：

```bash
# 监听单个文件
md2html input.md -w

# 监听目录并指定输出目录
md2html docs/ -w -o docs-html/

# 监听目录并使用自定义 CSS
md2html docs/ -w -s custom.css -o docs-html/
```

在监听模式下，您可以通过按 `Ctrl+C` 来停止监听。

### 监听模式的工作原理

监听模式使用 `chokidar` 库来监听文件系统的变化。当以下事件发生时，md2html-cli 会自动重新转换：

- **添加文件**: 当在监听目录中添加新的 Markdown 文件时
- **修改文件**: 当已存在的 Markdown 文件被修改时
- **删除文件**: 当 Markdown 文件被删除时，对应的 HTML 文件也会被删除

## 递归转换目录

当您转换一个目录时，md2html-cli 会自动递归地转换该目录及其所有子目录下的所有 Markdown 文件。

例如，如果您有以下目录结构：

```
docs/
├── getting-started.md
├── advanced.md
├── configuration.md
├── examples.md
├── faq.md
└── api/
    ├── v1.md
    └── v2.md
```

当您运行以下命令时：

```bash
md2html docs/ -o docs-html/
```

md2html-cli 会转换所有的 `.md` 文件，并在 `docs-html/` 目录中创建相同的目录结构：

```
docs-html/
├── getting-started.html
├── advanced.html
├── configuration.html
├── examples.html
├── faq.html
└── api/
    ├── v1.html
    └── v2.html
```

## 命令组合使用

您可以组合使用多个命令行参数来满足您的需求：

```bash
# 组合使用所有参数
md2html docs/ -w -s custom.css -o docs-html/

# 转换多个文件
md2html file1.md file2.md -o output/

# 使用相对路径和绝对路径
md2html ./docs/ -o /Users/user/documents/html/
```

## 常见用例

### 用例 1: 构建项目文档

假设您的项目中有一个 `docs/` 目录，包含了所有的项目文档。您可以使用以下命令将所有文档转换为 HTML：

```bash
md2html docs/ -o docs-html/
```

### 用例 2: 实时预览文档

在编写文档时，您可能希望能够实时预览修改后的效果。您可以使用监听模式来实现这一点：

```bash
md2html docs/ -w -o docs-html/
```

然后在浏览器中打开生成的 HTML 文件，并启用浏览器的自动刷新功能（大多数现代浏览器都支持这个功能，或者您可以使用浏览器插件）。

### 用例 3: 集成到构建流程中

您可以将 md2html-cli 集成到您的项目构建流程中。例如，在 `package.json` 中添加以下脚本：

```json
{
  "scripts": {
    "build:docs": "md2html docs/ -o docs-html/",
    "watch:docs": "md2html docs/ -w -o docs-html/",
    "build": "npm run build:docs && npm run build:app"
  }
}
```

然后您可以使用以下命令来构建文档：

```bash
npm run build:docs
```

或者使用以下命令来监听文档变化：

```bash
npm run watch:docs
```

或者使用以下命令来构建整个项目：

```bash
npm run build
```

## 总结

通过本文档，您已经了解了 md2html-cli 的高级用法，包括指定输出目录、使用自定义 CSS、启用监听模式等。

md2html-cli 是一个简单易用但功能强大的工具，可以帮助您快速将 Markdown 文档转换为 HTML 格式。

如果您在使用过程中遇到任何问题或有任何建议，请随时查看 [常见问题](faq.md) 文档或提交 Issue。
