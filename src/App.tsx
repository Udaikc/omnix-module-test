// src/App.tsx
import React from 'react';
import './App.css';// You can keep your CSS file

import CombinedNetworkGraph from './components/EyeBall'; // Import your network graph component

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Network Visualization</h1> {/* Or your app's title */}
      </header>
      <main>
        <CombinedNetworkGraph /> {/* Use your network graph component */}
      </main>
    </div>
  );
};

export default App;