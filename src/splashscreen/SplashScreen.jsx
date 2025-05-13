import { useState, useEffect } from 'react';
import styles from './SplashScreen.module.css';

const SplashScreen = ({ onComplete }) => {
    const [text, setText] = useState('');
    const [highlightDIY, setHighlightDIY] = useState(false);

    useEffect(() => {
        const animate = async () => {
            let current = '';

            // Этап 1: Печатаем "Raspizdiy"
            for (let char of 'Raspizdiy') {
                current += char;
                setText(current);
                await new Promise((r) => setTimeout(r, 200));
            }

            await new Promise((r) => setTimeout(r, 500));

            // Этап 2: Удаляем "diy"
            for (let i = 0; i < 3; i++) {
                current = current.slice(0, -1);
                setText(current);
                await new Promise((r) => setTimeout(r, 200));
            }

            await new Promise((r) => setTimeout(r, 400));

            // Этап 3: Добавляем "DIY"
            for (let char of 'DIY') {
                current += char;
                setText(current);
                await new Promise((r) => setTimeout(r, 200));
            }

            // Этап 4: добавляем "s" и выделяем
            current += 's';
            setText(current);
            await new Promise((r) => setTimeout(r, 200));
            setHighlightDIY(true);

            // Конец
            await new Promise((r) => setTimeout(r, 1000));
            onComplete();
        };

        void animate();

        return () => {};
    }, [onComplete]);

    return (
        <div className={styles.container}>
            <div className={`${styles.text} ${styles.glitch}`} data-text={text}>
                {text.split('').map((char, index) => {
                    const isDIY = text.length > 6 && index >= 6 && index <= 8;
                    return (
                        <span
                            key={index}
                            className={isDIY && highlightDIY ? styles.highlight : ''}
                        >
                            {char}
                        </span>
                    );
                })}
            </div>
        </div>
    );
};

export default SplashScreen;
