import { Article } from '@/lib/news'
import Image from 'next/image'

interface ArticleCardProps {
  article: Article
  accentColor?: string
}

export default function ArticleCard({ article, accentColor = '#2563eb' }: ArticleCardProps) {
  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative w-full h-44 bg-gray-200 overflow-hidden">
        <Image
          src={article.imageUrl}
          alt={article.headline}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized
        />
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {article.source}
          </span>
          <span className="text-gray-300">·</span>
          <time className="text-xs text-gray-400">{article.date}</time>
        </div>

        <h2 className="text-base font-bold text-gray-900 leading-snug mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors">
          {article.headline}
        </h2>

        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4">
          {article.excerpt}
        </p>

        <a
          href={article.url}
          className="inline-flex items-center text-sm font-semibold transition-colors"
          style={{ color: accentColor }}
        >
          Read More
          <svg className="ml-1 w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </article>
  )
}
