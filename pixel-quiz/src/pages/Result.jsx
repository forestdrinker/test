import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { submitScore } from '../services/api';

const Result = () => {
    const { gameState, resetGame } = useGame();
    const { score, userId, passed, questions, startTime, endTime } = gameState;

    useEffect(() => {
        // Auto submit score on mount
        const attempts = Math.floor((endTime - startTime) / 1000); // Mock duration or retry count if we tracked it
        // Actually "闖關次數" (attempts) is tracked by backend usually, but here we submit current run
        // Using attempts as dummy for now or strictly following required fields
        submitScore({
            userId,
            score,
            maxScore: score, // To be handled by backend logic max comparison
            passed,
            duration: attempts
        });
    }, []); // Run once

    return (
        <div className="pixel-card">
            <h1>GAME OVER</h1>

            <div style={{ margin: '2rem 0' }}>
                <p>SCORE: {score} / {questions.length}</p>
                <h2 style={{ color: passed ? '#00e756' : '#ff004d', marginTop: '1rem' }}>
                    {passed ? 'MISSION CLEARED!' : 'MISSION FAILED'}
                </h2>
            </div>

            <button onClick={resetGame}>RETURN TO TITLE</button>
        </div>
    );
};

export default Result;
