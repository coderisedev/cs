# Markdown 专用切片算法：结构化与语义化切片

在 RAG 系统中，切片（Chunking）的质量直接决定了检索的精度。对于 Markdown 文档，最有效的算法是**基于结构的切片（Structure-aware Chunking）**。

### 1. 为什么需要专用算法？

简单的**“固定字符数切片”**（如每 500 字一刀）会导致两个核心问题：
*   **截断代码**：可能将一个函数的定义与实现切分到两个不同的块中，使 LLM 无法理解完整的代码逻辑。
*   **丢失上下文**：正文内容可能失去了其父标题（如 `# 数据库配置`）的修饰，导致检索到的文本片段语义不完整。

### 2. 核心算法：MarkdownHeaderSplitter

这是处理 Markdown 最标准且最符合第一性原理的算法。

**原理**：
解析 Markdown 的抽象语法树（AST），以标题层级（`#`, `##`, `###`）为边界进行物理切分，并让每个子切片自动**“继承”**其所有父级标题作为元数据（Metadata）。

**示例逻辑**：
*   **原始文档**：`# 项目部署` -> `## 数据库` -> `这里是配置信息`
*   **切片元数据**：`{ "Header 1": "项目部署", "Header 2": "数据库" }`
*   **优势**：即便切片正文中没出现“数据库”三个字，通过元数据检索也能精准定位。

### 3. 实现方案推荐

#### A. LangChain (MarkdownHeaderTextSplitter)
适用于需要将标题层级显式提取到元数据的场景。
```python
from langchain.text_splitter import MarkdownHeaderTextSplitter

headers_to_split_on = [("#", "H1"), ("##", "H2")]
splitter = MarkdownHeaderTextSplitter(headers_to_split_on=headers_to_split_on)
splits = splitter.split_text(markdown_text)
```

#### B. LlamaIndex (MarkdownNodeParser)
更适合构建复杂的 RAG 索引，能自动识别代码块（Code Blocks）并确保其不被暴力切断。

#### C. 语义切片 (Semantic Chunking)
*   **原理**：通过计算相邻句子的向量相似度，在话题发生突变（相似度骤降）的位置进行切分。
*   **适用性**：适用于结构极度不规范的 Markdown。对于结构清晰的编程文档，其效果通常不如 Header Splitter，且计算成本更高。

### 4. 针对编程文档的黄金组合策略

对于几万个本地编程文档，推荐采用以下**组合切片策略**：

1.  **一级切分**：使用 `MarkdownHeaderSplitter` 按章节切大块，保留标题路径。
2.  **二级切分**：在章节内部，使用 `RecursiveCharacterTextSplitter`。
    *   **优先级设置**：`separators=["\n```", "\n\n", "\n", " ", ""]`。
    *   **效果**：优先在代码块边界、段落边界切分，最后才考虑在句子或单词间切分。

**总结建议**：
在本地 Mac 环境下，使用“结构化切片”不仅能保证搜索的“位置感”，还能最大限度减少 Embedding 的计算量，是效率与精度的平衡点。

```