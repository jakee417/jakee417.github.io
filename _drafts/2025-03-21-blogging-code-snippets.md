---
title: How I link code in blog posts
author: jake
date: 2025-03-21 12:00:00 +0800
categories: [Software Engineering]
tags: [blogging, github]
math: true
mermaid: false
markdown: kramdown
image:
  path: assets/img/custom/markov-social-inequality.png
  alt: Dynamically linked code snippet
---

Here is a summary of how to link code in jekyll websites.

## Markdown Code Snippet
For very fast code blocks that do not need to be synced to an code repo, we can simply wrap code in backticks:

```python
a = 5
```

```swift
let a = 5
```

```dart
final a = 5
```

As demonstrated on the chirpy starter blog [example](https://chirpy.cotes.page/posts/text-and-typography/#code-blocks).

## Gist-style dynamic links (`emgithub`)
When you have a code snippet that needs to be synchronized with a code repo, we can use [`emgithub`](https://emgithub.com/)

## Jupyter notebook (`nbconvert`)
When individually linking each code block is impractical, we can embed an entire markdown structure:

1. Create a [Jupyter Notebook](https://jupyter.org/) which consists of code cells and markdown cells.
2. Use `nbconvert` to export the entire notebook to the `_includes` directory as a markdown file:
    ```bash
    cd path/to/filename
    jupyter nbconvert filename --to markdown --output ~/path/to/blog.github.io/_includes/markdown/filename.md
    ```
3. Include the markdown file into your blog with `{% raw %}{% include markdown/filename.md %}{% endraw %}`

> Embedded images/plots (i.e. from matplotlib or seaborn) will be created as static assets that need to be manually copied to the `assets` directory of your blog.
{: .prompt-warning } 
 
Alternatively, you can use a library like [plotly](https://plotly.com/) to embed html directly to your notebook:

```python
def render_plotly_html(fig: go.Figure) -> None:
    fig.show()
    display(
        Markdown(
            fig.to_html(
                include_plotlyjs="cdn",
            )
        )
    )

def render_table(df: pd.DataFrame | pd.Series) -> None:
    display(Markdown(df.to_markdown()))
```
