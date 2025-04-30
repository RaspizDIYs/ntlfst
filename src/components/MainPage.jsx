import React from 'react';
import logo from '../assets/logo.svg';
import styles from './MainPage.module.css';

const MainPage = () => {
    return (
        <div className={styles.container}>
            <div className={styles.logoContainer}>
                <img
                    src={logo}
                    alt="Logo"
                    className={styles.logo}
                />
            </div>
        </div>
    );
};

export default MainPage;
