import { useState } from 'react';
import SplashScreen from './components/SplashScreen';
import MainPage from './components/MainPage';

function App() {
    const [showSplash, setShowSplash] = useState(true);

    return (
        <>
            {showSplash ? (
                <SplashScreen onComplete={() => setShowSplash(false)} />
            ) : (
                <MainPage />
            )}
        </>
    );
}

export default App;