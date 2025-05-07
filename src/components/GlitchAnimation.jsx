import React, { useEffect, useState } from "react";
import "./glitch-effect.css";

const GlitchAnimation = () => {
    const [squares, setSquares] = useState([]);

    useEffect(() => {
        const generateSquares = () => {
            const squareCount = 15; // Количество квадратов
            const generatedSquares = Array.from({ length: squareCount }, (_, index) => ({
                id: index,
                randX: `${Math.random() * 100}%`, // Случайная позиция по X
                randY: `${Math.random() * 100}%`, // Случайная позиция по Y
                randScale: Math.random() * 1.5 + 0.5, // Случайный масштаб (размер)
            }));
            setSquares(generatedSquares);
        };

        generateSquares();

        // Перегенерация каждые 5 секунд
        const interval = setInterval(generateSquares, 5000);
        return () => clearInterval(interval); // Очистка интервала при размонтировании
    }, []);

    return (
        <div>
            {squares.map((square) => (
                <div
                    key={square.id}
                    className="glitch-square"
                    style={{
                        top: square.randY,
                        left: square.randX,
                        width: `${Math.random() * 50 + 10}px`,
                        height: `${Math.random() * 50 + 10}px`,
                        transform: `translate(${square.randX}, ${square.randY}) scale(${square.randScale})`,
                    }}
                />
            ))}
        </div>
    );
};

export default GlitchAnimation;