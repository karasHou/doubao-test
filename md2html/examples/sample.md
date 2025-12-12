# md2html-cli 示例文档

这是一个用于演示 md2html-cli 功能的示例 Markdown 文件。

## 功能特点

md2html-cli 是一个跨平台的 Markdown 转 HTML 命令行工具，具有以下特点：

- **跨平台支持**: 可在 Windows、macOS 和 Linux 上运行
- **快速转换**: 支持单个文件和整个目录的递归转换
- **语法高亮**: 内置 highlight.js，支持 190+ 种编程语言的代码高亮
- **响应式设计**: 生成的 HTML 页面在各种设备上都能良好显示
- **自定义样式**: 支持添加自定义 CSS 文件，轻松定制页面样式
- **监听模式**: 实时监听文件变化，自动重新转换

## 使用示例

### 基本使用

转换单个 Markdown 文件：

```bash
md2html sample.md
```

转换结果将保存到 `./dist/sample.html`。

### 转换目录

转换整个目录及其子目录下的所有 Markdown 文件：

```bash
md2html docs/
```

### 指定输出目录

使用 `-o` 或 `--output` 参数指定输出目录：

```bash
md2html sample.md -o ../html-output/
```

### 使用自定义 CSS

通过 `-s` 或 `--style` 参数添加自定义 CSS 文件：

```bash
md2html sample.md -s custom.css
```

### 监听模式

使用 `-w` 或 `--watch` 参数启用监听模式，文件变化时自动重新转换：

```bash
md2html docs/ -w -o docs-html/
```

## 支持的 Markdown 元素

### 标题

支持从 H1 到 H6 的标题：

# H1 标题
## H2 标题
### H3 标题
#### H4 标题
##### H5 标题
###### H6 标题

### 段落和强调

这是一个普通段落。

*斜体文本*
**粗体文本**
***加粗斜体***
~~删除线~~

### 列表

#### 无序列表

- 项目 1
- 项目 2
  - 子项目 2.1
  - 子项目 2.2
- 项目 3

#### 有序列表

1. 第一项
2. 第二项
   1. 子项 2.1
   2. 子项 2.2
3. 第三项

#### 任务列表

- [x] 已完成的任务
- [ ] 待完成的任务
- [x] 另一个已完成的任务

### 链接和图片

#### 链接

[GitHub](https://github.com)
[md2html-cli](https://github.com/example/md2html-cli "md2html-cli 工具")

#### 图片

![示例图片](https://via.placeholder.com/600x300?text=Sample+Image)

### 代码

#### 行内代码

这是一个行内代码示例：`console.log("Hello, World!");`

#### 代码块

```javascript
// JavaScript 示例
function helloWorld() {
    console.log("Hello, World!");
    return true;
}

// 调用函数
helloWorld();
```

```python
# Python 示例
def hello_world():
    print("Hello, World!")
    return True

# 调用函数
hello_world()
```

```java
// Java 示例
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

```bash
# Bash 示例
echo "Hello, World!"
ls -la
cd /path/to/directory
```

### 引用

这是一个引用示例：

> 成功的秘诀在于目标的坚定。——迪斯雷利

> 这是一个多行引用的示例。
>
> 引用可以包含多个段落。
>
> - 引用中的列表项 1
> - 引用中的列表项 2

### 表格

| 姓名 | 年龄 | 性别 | 职位 |
|------|------|------|------|
| 张三 | 28 | 男 | 工程师 |
| 李四 | 32 | 男 | 项目经理 |
| 王五 | 25 | 女 | 设计师 |

| 产品 | 价格 | 销量 | 总额 |
|------|------|------|------|
| 产品 A | 100 | 50 | 5000 |
| 产品 B | 200 | 30 | 6000 |
| 产品 C | 150 | 40 | 6000 |

### 分割线

---

***

## 自定义样式示例

md2html-cli 支持自定义 CSS 样式。以下是一个简单的自定义样式示例：

```css
/* custom.css */

/* 修改页面背景色和主色调 */
body {
    background-color: #f5f5f5;
    color: #333;
}

/* 修改链接样式 */
.content a {
    color: #2c3e50;
    border-bottom-color: #3498db;
}

.content a:hover {
    color: #3498db;
    border-bottom-color: #2980b9;
}

/* 修改代码块样式 */
.content pre {
    background-color: #2c3e50;
    border-color: #34495e;
}

.content code {
    background-color: #ecf0f1;
    color: #e74c3c;
}

.content pre code {
    background-color: transparent;
    color: #ecf0f1;
}

/* 修改引用样式 */
.content blockquote {
    border-left-color: #3498db;
    background-color: #ecf0f1;
    padding: 15px;
    border-radius: 4px;
}
```

将此文件保存为 `custom.css`，然后使用以下命令转换 Markdown 文件：

```bash
md2html sample.md -s custom.css
```

## 常见问题

### Q: 转换后的 HTML 文件在哪里？

A: 默认情况下，转换后的 HTML 文件保存在 `./dist` 目录中。可以使用 `-o` 参数指定自定义输出目录。

### Q: 如何自定义输出样式？

A: 可以通过 `-s` 参数指定自定义 CSS 文件。自定义 CSS 将被追加到默认样式之后，可以覆盖默认样式。

### Q: 支持哪些编程语言的语法高亮？

A: 内置的 highlight.js 库支持 190 多种编程语言的语法高亮，包括常见的 JavaScript、Python、Java、C++、PHP、Go、Rust 等。

### Q: 监听模式下如何停止？

A: 在终端中按 `Ctrl+C` 即可停止监听模式。

## 总结

md2html-cli 是一个简单易用、功能强大的 Markdown 转 HTML 工具，适用于各种场景，无论是个人使用还是团队协作。

---

**注意**: 这只是一个示例文档，实际使用时请根据自己的需求进行调整。
