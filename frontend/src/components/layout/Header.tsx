import "./Header.scss";

export default function Header() {
    return (
        <header className="header">
            <div className="header__inner">
                <h1 className="header__title">The Good News</h1>
                <p className="header__subtitle">
                    Only the headlines worth reading
                </p>
            </div>
        </header>
    );
}
