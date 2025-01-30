import React from 'react';
import './App.css';
import Calendar from './components/Calendar';
import GoogleCalendar from './components/calendal2';
import GoogleCalendarEmbed from './components/calendarview';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Google Calendar Integration</h1>
      </header>
      <main>
        <GoogleCalendarEmbed />
        {/* <Calendar /> */}
        <GoogleCalendar/>
      </main>
    </div>
  );
}

export default App;