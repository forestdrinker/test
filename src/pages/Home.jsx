import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { fetchQuestions } from '../services/api';

const Home = () => {
    const [inputUserId, setInputUserId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { startGame } = useGame();

    const handleStart = async (e) => {
        e.preventDefault();
        if (!inputUserId.trim()) {
            setError('PLEASE ENTER ID');
            return;
        }
        setLoading(true);
        setError('');

        try {
            const count = parseInt(import.meta.env.VITE_QUESTION_COUNT || '5', 10);
            const questions = await fetchQuestions(count);
            startGame(inputUserId, questions);
        } catch (err) {
            console.error(err);
            setError('FAILED TO LOAD DATA');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pixel-card">
            <h1>PIXEL QUIZ</h1>
            <p style={{ marginBottom: '2rem' }}>ENTER YOUR ID TO START</p>

            <form onSubmit={handleStart}>
                <input
                    type="text"
                    placeholder="USER ID"
                    value={inputUserId}
                    onChange={(e) => setInputUserId(e.target.value)}
                    disabled={loading}
                />
                <br />
                {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? 'LOADING...' : 'START GAME'}
                </button>
            </form>
        </div>
    );
};

export default Home;
