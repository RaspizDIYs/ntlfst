import { useState, useEffect } from 'react';
import { getOrgMembers, getUserRepos, getRepoLanguages } from '../api/githubApi';
import MembersList from './MembersList';
import DeveloperCard from './DeveloperCard';
import styles from './MainPage.module.css';

const MainPage = () => {
    const [members, setMembers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [languages, setLanguages] = useState({});

    useEffect(() => {
        const fetchMembers = async () => {
            const orgMembers = await getOrgMembers('RaspizDIYs');
            setMembers(orgMembers);
        };
        fetchMembers();
    }, []);

    useEffect(() => {
        const fetchLanguages = async () => {
            if (selectedUser) {
                const repos = await getUserRepos(selectedUser.login);
                let langStats = {};

                for (const repo of repos) {
                    const langs = await getRepoLanguages(selectedUser.login, repo.name);
                    for (const [lang, bytes] of Object.entries(langs)) {
                        langStats[lang] = (langStats[lang] || 0) + bytes;
                    }
                }

                setLanguages(langStats);
            }
        };

        fetchLanguages();
    }, [selectedUser]);

    return (
        <div className={styles.container}>
            <div className={styles.logoContainer}>
                <img
                    src="https://github.com/RaspizDIYs.png"
                    alt="Organization Logo"
                    className={styles.logo}
                />
            </div>

            <MembersList
                members={members}
                onSelect={setSelectedUser}
                className={styles.membersList}
            />

            {selectedUser && (
                <DeveloperCard
                    user={selectedUser}
                    languages={languages}
                    onClose={() => setSelectedUser(null)}
                />
            )}
        </div>
    );
};

export default MainPage;