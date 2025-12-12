import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import Home from './pages/Home';
import Game from './pages/Game';
import Result from './pages/Result';
import './App.css';

const GameContainer = () => {
  const { gameState } = useGame();

  return (
    <div className="app-container">
      {gameState.status === 'idle' && <Home />}
      {gameState.status === 'playing' && <Game />}
      {gameState.status === 'completed' && <Result />}
    </div>
  );
};

function App() {
  return (
    <GameProvider>
      <GameContainer />
    </GameProvider>
  );
}

export default App;
