import { NormalizedArticle } from "../../services/types";
import ArticleCard from "./ArticleCard";
import "./ArticleGrid.scss";

interface ArticleGridProps {
    articles: NormalizedArticle[];
}

export default function ArticleGrid({ articles }: ArticleGridProps) {
    return (
        <div className="article-grid">
            {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
            ))}
        </div>
    );
}
