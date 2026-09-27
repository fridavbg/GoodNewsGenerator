import { useSearchArticles } from "./hooks/useApi";
import Layout from "./components/layout/Layout";
import ArticleGrid from "./components/articles/ArticleGrid";

export default function App() {
    const { articles, loading, error } = useSearchArticles("good news", {
        autoFetch: true,
    });

    return (
        <Layout>
            <h2>Today's Good News</h2>
            {loading && <p>Loading…</p>}
            {error && <p role="alert">Something went wrong: {error}</p>}
            {!loading && !error && articles.length === 0 && (
                <p>No good news found right now. Try again later.</p>
            )}
            {!loading && !error && articles.length > 0 && (
                <ArticleGrid articles={articles} />
            )}
        </Layout>
    );
}
