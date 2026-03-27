import { Article } from '@/lib/news'
import ArticleCard from './ArticleCard'

interface NewsFeedProps {
  articles: Article[]
  accentColor?: string
}

export default function NewsFeed({ articles, accentColor }: NewsFeedProps) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No articles available at this time.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} accentColor={accentColor} />
      ))}
    </div>
  )
}
