import React from 'react';
import './App.css';
import GoogleCalendar from './components/calendal2';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Google Calendar Integration</h1>
      </header>
      <main>
        <GoogleCalendar/>
      </main>
    </div>
  );
}

export default App;