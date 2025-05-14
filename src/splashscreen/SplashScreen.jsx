import { useState, useEffect } from 'react';
import styles from "./SplashScreen.module.css";

const SplashScreen = ({ onComplete }) => {
    const [text, setText] = useState('');
    const [highlightDIY, setHighlightDIY] = useState(false);

    useEffect(() => {
        const animate = async () => {
            // Этап 1: Печатаем "Raspizdiy" по буквам
            let current = '';
            for (let char of 'Raspizdiy') {
                current += char;
                setText(current);
                await new Promise(r => setTimeout(r, 150));
            }

            // Пауза перед стиранием
            await new Promise(r => setTimeout(r, 500));

            // Этап 2: Стираем "diy" (3 последние буквы) по одной
            for (let i = 0; i < 3; i++) {
                current = current.slice(0, -1);
                setText(current);
                await new Promise(r => setTimeout(r, 100));
            }

            // Пауза перед добавлением DIY
            await new Promise(r => setTimeout(r, 300));

            // Этап 3: Печатаем "DIY" заглавными по буквам
            for (let char of 'DIY') {
                current += char;
                setText(current);
                await new Promise(r => setTimeout(r, 150));
            }

            // Этап 4: Добавляем "s" и подсвечиваем
            current += 's';
            setText(current);
            await new Promise(r => setTimeout(r, 200));
            setHighlightDIY(true);

            // Завершение через 1 секунду
            await new Promise(r => setTimeout(r, 1000));
            onComplete(); // Уведомляем App о завершении анимации
        };

        animate();
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