import { useTopHeadlines } from "./hooks/useApi";
import Layout from "./components/layout/Layout";
import ArticleGrid from "./components/articles/ArticleGrid";

export default function App() {
    const { articles, loading, error } = useTopHeadlines("us");

    return (
        <Layout>
            <h2>Top Headlines</h2>
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
            {!loading && !error && <ArticleGrid articles={articles} />}
        </Layout>
    );
}
