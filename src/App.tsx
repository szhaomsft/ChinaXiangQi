import React from 'react';
import { GameProvider } from './context/GameContext';
import { BoardComponent } from './components/Board/BoardComponent';
import { GameControls } from './components/Controls/GameControls';
import './App.css';

function App() {
  return (
    <GameProvider>
      <div className="app">
        <div className="game-container">
          <BoardComponent />
          <GameControls />
        </div>
      </div>
    </GameProvider>
  );
}

export default App;
