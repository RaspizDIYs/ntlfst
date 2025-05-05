import { FiGithub } from 'react-icons/fi';

const DeveloperCard = ({ user, languages, onClose }) => {
    const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);

    return (
        <div className="card-overlay">
            <div className="developer-card">
                <button className="close-btn" onClick={onClose}>×</button>

                <img
                    src={user.avatar_url}
                    alt={user.login}
                    className="card-avatar"
                />

                <h2 className="username">{user.login}</h2>

                <div className="languages">
                    {Object.entries(languages).map(([lang, bytes]) => (
                        <div key={lang} className="language-bar">
                            <div
                                className="bar-fill"
                                style={{
                                    width: `${(bytes / totalBytes) * 100}%`,
                                    backgroundColor: getLanguageColor(lang)
                                }}
                            />
                            <span className="language-label">{lang}</span>
                        </div>
                    ))}
                </div>

                <a
                    href={user.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="github-link"
                >
                    <FiGithub size={32} />
                </a>
            </div>
        </div>
    );
};

// Пример цветов для языков
const getLanguageColor = (language) => {
    const colors = {
        JavaScript: '#f1e05a',
        Python: '#3572A5',
        HTML: '#e34c26',
        CSS: '#563d7c',
        TypeScript: '#2b7489',
        // Добавьте другие языки по необходимости
    };
    return colors[language] || '#cccccc';
};

export default DeveloperCard;