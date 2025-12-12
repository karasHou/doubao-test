# md2html-cli

A cross-platform CLI tool to convert Markdown to HTML with built-in syntax highlighting and responsive design.

## Features

- **Cross-platform**: Works on Windows, macOS, and Linux
- **Single file or directory conversion**: Convert individual Markdown files or entire directories recursively
- **Syntax highlighting**: Built-in code block syntax highlighting for over 190 languages
- **Responsive design**: HTML output is fully responsive and works on all devices
- **Custom CSS**: Support for custom CSS files to customize the output styling
- **Watch mode**: Automatically recompile Markdown files when changes are detected
- **Simple and fast**: Easy to use with minimal dependencies

## Installation

### Prerequisites

- Node.js (version 14 or higher)
- npm (Node Package Manager)

### Global Installation

```bash
npm install -g md2html-cli
```

### Local Installation

```bash
npm install md2html-cli --save-dev
```

## Usage

### Basic Usage

Convert a single Markdown file:

```bash
md2html input.md
```

Convert an entire directory recursively:

```bash
md2html docs/
```

### Output Directory

Specify a custom output directory:

```bash
md2html input.md -o output/
md2html docs/ --output docs-html/
```

If no output directory is specified, the default is `./dist`.

### Custom CSS

Use a custom CSS file to style the HTML output:

```bash
md2html input.md -s custom.css
md2html docs/ --style styles/main.css
```

The custom CSS will be appended to the default styles.

### Watch Mode

Watch a file or directory for changes and automatically recompile:

```bash
md2html input.md -w
md2html docs/ --watch
```

Press `Ctrl+C` to exit watch mode.

### Help

Display the help message:

```bash
md2html --help
```

### Version

Display the current version:

```bash
md2html --version
```

## Examples

### Example 1: Convert a Single File

```bash
md2html README.md
```

This will convert `README.md` to `./dist/README.html`.

### Example 2: Convert a Directory with Custom Output

```bash
md2html docs/ -o docs-html/
```

This will convert all Markdown files in the `docs/` directory to HTML and save them in `docs-html/`.

### Example 3: Watch Mode with Custom CSS

```bash
md2html docs/ -w -s custom.css -o docs-html/
```

This will watch the `docs/` directory for changes, use `custom.css` for styling, and save the output to `docs-html/`.

## Output Structure

By default, the HTML output is saved in the `./dist` directory. For example:

```
project/
├── input.md
└── dist/
    └── input.html
```

When converting a directory, the output structure will mirror the input structure:

```
project/
├── docs/
│   ├── getting-started.md
│   └── advanced/
│       └── configuration.md
└── dist/
    ├── getting-started.html
    └── advanced/
        └── configuration.html
```

## Default Styles

The generated HTML includes a clean, modern default stylesheet with:

- Responsive design
- Syntax highlighting for code blocks
- Clean typography with proper spacing
- Support for all Markdown elements (headings, lists, links, images, tables, etc.)

## Customization

### Custom CSS

You can customize the output styling by providing a custom CSS file. The custom CSS will be appended to the default styles, so you can override specific styles or add new ones.

For example, to change the primary color:

```css
/* custom.css */
:root {
  --primary-color: #2563eb;
}

.content a {
  color: var(--primary-color);
}

.content a:hover {
  color: #1d4ed8;
}

.content blockquote {
  border-left-color: var(--primary-color);
}
```

Then use it with:

```bash
md2html input.md -s custom.css
```

## Supported Markdown Features

- **Headings**: # H1 to ###### H6
- **Paragraphs**: Regular text paragraphs
- **Lists**: Ordered lists (1., 2., 3.) and unordered lists (*, -, +)
- **Links**: Inline links [text](url) and reference links
- **Images**: ![alt text](image-url)
- **Code**: Inline code `code` and code blocks (```language)
- **Blockquotes**: > Quote text
- **Tables**: Markdown tables with headers and cells
- **Horizontal rules**: --- or ***
- **Emphasis**: Italic *text* or _text_, bold **text** or __text__, strikethrough ~~text~~
- **Task lists**: - [x] Completed task, - [ ] Incomplete task

## Dependencies

- **commander**: Command-line interface framework
- **marked**: Markdown parser and compiler
- **highlight.js**: Syntax highlighting library
- **chokidar**: File system watcher
- **glob**: File pattern matching

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Issues

If you encounter any issues or have suggestions, please open an issue on the GitHub repository.
