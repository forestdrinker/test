import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';

const Game = () => {
    const { gameState, answerQuestion } = useGame();
    const { questions, currentQuestionIndex, score } = gameState;
    const currentQuestion = questions[currentQuestionIndex];

    // Clean text from spaces or invisible chars for seed
    const seed = currentQuestion ? currentQuestion.id.toString() : 'boss';
    const bossImage = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${seed}`;

    if (!currentQuestion) return <div>LOADING FINAL...</div>;

    return (
        <div className="game-container">
            <div className="stats-bar" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span>SCORE: {score}</span>
                <span>STAGE: {currentQuestionIndex + 1}/{questions.length}</span>
            </div>

            <div className="avatar-container">
                <div className="avatar-frame">
                    <img src={bossImage} alt="Boss" />
                </div>
            </div>

            <div className="pixel-card">
                <h2 style={{ fontSize: '1.2rem', lineHeight: '1.6' }}>{currentQuestion.question}</h2>

                <div className="options-grid">
                    {currentQuestion.options.map((option, idx) => (
                        <button key={idx} onClick={() => answerQuestion(option === currentQuestion.answer)}>
                            {option}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Game;
