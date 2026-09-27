import type { Article } from "@goodnews/shared";
import ArticleCard from "./ArticleCard";
import "./ArticleGrid.scss";

interface ArticleGridProps {
    articles: Article[];
}

export default function ArticleGrid({ articles }: ArticleGridProps) {
    return (
        <div className="article-grid">
            {articles.map((article) => (
                <ArticleCard
                    key={article.id}
                    article={article}
                />
            ))}
        </div>
    );
}
