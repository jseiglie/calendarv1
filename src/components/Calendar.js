import React, { useEffect, useState } from 'react';

const Calendar = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);
  // AIzaSyCIg3V7XSlINTmvkI-oPmsQmqDODnF9wEA
  const fetchEvents = async () => {
    // Fetch events from Google Calendar API
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer YOUR_ACCESS_TOKEN`, // Replace with your access token
      },
    });
    const data = await response.json();
    setEvents(data.items);
  };

  const createEvent = async (event) => {
    // Create a new event in Google Calendar
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer YOUR_ACCESS_TOKEN`, // Replace with your access token
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
    const data = await response.json();
    setEvents([...events, data]);
  };

  return (
    <div>
      <h2>My Google Calendar Events</h2>
      <ul>
        {events.map(event => (
          <li key={event.id}>{event.summary}</li>
        ))}
      </ul>
      {/* Add a form or button to create new events */}
    </div>
  );
};

export default Calendar;