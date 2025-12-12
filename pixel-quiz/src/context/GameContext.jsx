import React, { createContext, useContext, useState } from 'react';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
    const [gameState, setGameState] = useState({
        userId: null,
        status: 'idle', // idle, playing, completed
        score: 0,
        questions: [],
        currentQuestionIndex: 0,
        passed: false,
        startTime: null,
        endTime: null,
    });

    const startGame = (userId, questions) => {
        setGameState({
            userId,
            status: 'playing',
            score: 0,
            questions,
            currentQuestionIndex: 0,
            passed: false,
            startTime: Date.now(),
            endTime: null,
        });
    };

    const answerQuestion = (isCorrect) => {
        setGameState((prev) => {
            const newScore = isCorrect ? prev.score + 1 : prev.score;
            const nextIndex = prev.currentQuestionIndex + 1;
            const isFinished = nextIndex >= prev.questions.length;

            const passThreshold = parseInt(import.meta.env.VITE_PASS_THRESHOLD || '3', 10);

            if (isFinished) {
                return {
                    ...prev,
                    score: newScore,
                    status: 'completed',
                    passed: newScore >= passThreshold,
                    endTime: Date.now(),
                };
            }

            return {
                ...prev,
                score: newScore,
                currentQuestionIndex: nextIndex,
            };
        });
    };

    const resetGame = () => {
        setGameState({
            userId: null,
            status: 'idle',
            score: 0,
            questions: [],
            currentQuestionIndex: 0,
            passed: false,
            startTime: null,
            endTime: null,
        });
    };

    return (
        <GameContext.Provider value={{ gameState, startGame, answerQuestion, resetGame }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => useContext(GameContext);
