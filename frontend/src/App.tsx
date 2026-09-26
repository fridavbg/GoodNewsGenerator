import { useTopHeadlines } from './hooks/useApi';

export default function App() {
  const { articles, loading, error } = useTopHeadlines('us');

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {articles.length > 0 && (
        <div>
          <h1>Top Headlines ({articles.length})</h1>
          {articles.slice(0, 5).map((article) => (
            <div key={article.id} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
              <h3>{article.title}</h3>
              <p>{article.description}</p>
              <small>{article.source} • {new Date(article.publishedAt).toLocaleDateString()}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}