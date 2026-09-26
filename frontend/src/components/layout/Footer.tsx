import "./Footer.scss";

export default function Footer() {
    return (
        <footer className="footer">
            <p className="footer__inner">
                © {new Date().getFullYear()} The Good News · Powered by{" "}
                <a
                    href="https://newsapi.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    NewsAPI.org
                </a>
            </p>
        </footer>
    );
}
