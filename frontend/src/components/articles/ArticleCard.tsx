import React from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { toggleFavorite } from "../../store/slices/uiSlice";
import { NormalizedArticle } from "../../services/types";
import { AiFillStar } from "react-icons/ai";
import "./ArticleCard.scss";

interface ArticleCardProps {
    article: NormalizedArticle;
}

export default function ArticleCard({ article }: ArticleCardProps) {
    const dispatch = useAppDispatch();
    const favorites = useAppSelector(
        (state: { ui: { favorites: any } }) => state.ui.favorites,
    );
    const isFavorited = favorites.some(
        (fav: { id: any }) => fav.id === article.id,
    );

    const handleToggleFavorite = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch(toggleFavorite(article));
    };

    const handleCardClick = () => {
        window.open(article.url, "_blank", "noopener,noreferrer");
    };

    return (
        <article
            className="article-card"
            onClick={handleCardClick}
        >
            <div className="article-card__image">
                {article.imageUrl && (
                    <img
                        src={article.imageUrl}
                        alt={article.title}
                    />
                )}
            </div>

            <div className="article-card__content">
                <header className="article-card__header">
                    <h3 className="article-card__title">{article.title}</h3>
                    <button
                        className={`article-card__favorite ${isFavorited ? "active" : ""}`}
                        onClick={handleToggleFavorite}
                        aria-label={
                            isFavorited
                                ? "Remove from favorites"
                                : "Add to favorites"
                        }
                    >
                        <AiFillStar />
                    </button>
                </header>

                {article.description && (
                    <p className="article-card__description">
                        {article.description}
                    </p>
                )}

                <footer className="article-card__footer">
                    <span className="article-card__source">
                        {article.source}
                    </span>
                    <span className="article-card__date">
                        {new Date(article.publishedAt).toLocaleDateString()}
                    </span>
                    {article.author && (
                        <span className="article-card__author">
                            by {article.author}
                        </span>
                    )}
                </footer>

                <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="article-card__link"
                >
                    Read more
                </a>
            </div>
        </article>
    );
}
