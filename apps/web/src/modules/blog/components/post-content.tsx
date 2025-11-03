import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface PostContentProps {
  content: string
}

export default function PostContent({ content }: PostContentProps) {
  return (
    <div className="prose prose-lg max-w-none prose-headings:text-ui-fg-base prose-p:text-ui-fg-base prose-a:text-ui-fg-interactive prose-a:no-underline hover:prose-a:underline prose-strong:text-ui-fg-base prose-code:text-ui-fg-interactive prose-code:bg-ui-bg-subtle prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-ui-bg-subtle prose-pre:border prose-pre:border-ui-border-base prose-blockquote:border-l-4 prose-blockquote:border-ui-border-interactive prose-blockquote:bg-ui-bg-subtle prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:not-italic prose-img:rounded-lg prose-hr:border-ui-border-base">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}
