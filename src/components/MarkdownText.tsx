'use client'

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function renderInline(value: string) {
  return escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
}

function markdownToHtml(markdown: string) {
  const lines = markdown.split('\n')
  const html: string[] = []
  let inList = false

  for (const line of lines) {
    const trimmed = line.trim()

    if (!trimmed) {
      if (inList) {
        html.push('</ul>')
        inList = false
      }
      html.push('<br />')
      continue
    }

    const bullet = trimmed.match(/^[-*]\s+(.+)/)
    if (bullet) {
      if (!inList) {
        html.push('<ul>')
        inList = true
      }
      html.push(`<li>${renderInline(bullet[1])}</li>`)
      continue
    }

    if (inList) {
      html.push('</ul>')
      inList = false
    }

    if (trimmed.startsWith('### ')) {
      html.push(`<h3>${renderInline(trimmed.slice(4))}</h3>`)
    } else if (trimmed.startsWith('## ')) {
      html.push(`<h2>${renderInline(trimmed.slice(3))}</h2>`)
    } else if (trimmed.startsWith('# ')) {
      html.push(`<h1>${renderInline(trimmed.slice(2))}</h1>`)
    } else {
      html.push(`<p>${renderInline(trimmed)}</p>`)
    }
  }

  if (inList) html.push('</ul>')
  return html.join('')
}

export function MarkdownText({ content }: { content: string }) {
  return (
    <div
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
    />
  )
}
