import { useEffect, useState } from "react";
import { gapi } from "gapi-script";

const CLIENT_ID = "414379219750-lm3ligbbu73rf0ceta0q2camgn416ooq.apps.googleusercontent.com";
const API_KEY = "AIzaSyCIg3V7XSlINTmvkI-oPmsQmqDODnF9wEA";
const SCOPES = "https://www.googleapis.com/auth/calendar";

const GoogleCalendar = () => {
  const [events, setEvents] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [freeTimeSlots, setFreeTimeSlots] = useState({});

  useEffect(() => {
    function start() {
      gapi.client
        .init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: [
            "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
          ],
          scope: SCOPES,
        })
        .then(() => {
          const auth = gapi.auth2.getAuthInstance();
          setIsSignedIn(auth.isSignedIn.get());
          auth.isSignedIn.listen(setIsSignedIn);
        });
    }

    gapi.load("client:auth2", start);
  }, []);

  const handleAuthClick = () => {
    gapi.auth2.getAuthInstance().signIn();
  };

  const handleSignOutClick = () => {
    gapi.auth2.getAuthInstance().signOut();
    setEvents([]);
  };

  const fetchEvents = async () => {
    if (!isSignedIn) return;

    try {
      const response = await gapi.client.calendar.events.list({
        calendarId: "primary",
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 100,
        orderBy: "startTime",
      });

      const events = response.result.items || [];
      console.log("Fetched events: ", events);
      setEvents(events);
      calculateFreeTimeSlots(events);
    } catch (error) {
      console.error("Error fetching events: ", error);
    }
  };

  const schedule = {
    0: { start: 0, end: 0 }, // Sunday (no meetings)
    1: { start: 8, end: 18 }, // Monday
    2: { start: 8, end: 18 }, // Tuesday
    3: { start: 8, end: 18 }, // Wednesday
    4: { start: 8, end: 18 }, // Thursday
    5: { start: 8, end: 18 }, // Friday
    6: { start: 10, end: 14 }, // Saturday
  };

  const calculateFreeTimeSlots = (events) => {
    const freeTimeSlots = {};

    for (let day = 0; day < 7; day++) {
      const allowedHours = schedule[day];
      const dayStart = new Date();
      dayStart.setUTCDate(dayStart.getUTCDate() - dayStart.getUTCDay() + day);
      dayStart.setUTCHours(allowedHours.start, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setUTCHours(allowedHours.end, 0, 0, 0);

      freeTimeSlots[day] = [{ start: dayStart, end: dayEnd }];
    }

    events.forEach(event => {
      const start = new Date(event.start.dateTime);
      const end = new Date(event.end.dateTime);
      const day = start.getUTCDay();

      if (!freeTimeSlots[day]) {
        freeTimeSlots[day] = [];
      }

      freeTimeSlots[day] = freeTimeSlots[day].reduce((slots, slot) => {
        if (start >= slot.end || end <= slot.start) {
          slots.push(slot);
        } else {
          if (start > slot.start) {
            slots.push({ start: slot.start, end: start });
          }
          if (end < slot.end) {
            slots.push({ start: end, end: slot.end });
          }
        }
        return slots;
      }, []);
    });

    console.log("Free Time Slots: ", freeTimeSlots);
    setFreeTimeSlots(freeTimeSlots);
  };

  const addEvent = async (start, end) => {
    if (!isSignedIn) return;

    const event = {
      summary: "Meeting with Javier",
      location: "Online",
      description: "Discussing React project",
      start: {
        dateTime: start.toISOString(),
        timeZone: "Europe/Madrid",
      },
      end: {
        dateTime: end.toISOString(),
        timeZone: "Europe/Madrid",
      },
    };

    try {
      const response = await gapi.client.calendar.events.insert({
        calendarId: "primary",
        resource: event,
      });

      console.log("Event Created: ", response.result);
      fetchEvents(); // Refresh events and free time slots
    } catch (error) {
      console.error("Error creating event: ", error);
    }
  };

  const renderFreeTimeSlots = () => {
    return Object.keys(freeTimeSlots).map(day => (
      <div key={day}>
        <h3>{["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day]}</h3>
        {freeTimeSlots[day].map((slot, index) => {
          const oneHourSlots = [];
          let currentStart = new Date(slot.start);
          while (currentStart < slot.end) {
            const currentEnd = new Date(currentStart);
            currentEnd.setHours(currentEnd.getHours() + 1);
            if (currentEnd <= slot.end) {
              oneHourSlots.push({ start: new Date(currentStart), end: new Date(currentEnd) });
            }
            currentStart.setHours(currentStart.getHours() + 1);
          }
          return oneHourSlots.map((oneHourSlot, idx) => (
            <div key={idx}>
              {oneHourSlot.start.toLocaleTimeString()} - {oneHourSlot.end.toLocaleTimeString()}
              <button onClick={() => addEvent(oneHourSlot.start, oneHourSlot.end)}>Select</button>
            </div>
          ));
        })}
      </div>
    ));
  };

  return (
    <div>
      <button onClick={handleAuthClick}>Sign In</button>
      <button onClick={handleSignOutClick}>Sign Out</button>
      <button onClick={fetchEvents}>Fetch Events</button>
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            {event.summary} - {event.start?.dateTime || event.start?.date}
          </li>
        ))}
      </ul>
      {renderFreeTimeSlots()}
    </div>
  );
};

export default GoogleCalendar;