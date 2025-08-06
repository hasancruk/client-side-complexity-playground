import { Hono } from 'hono';
import type { FC } from 'hono/jsx';
import { findWave, handleSearchEvents } from './data.js';

const app = new Hono();

app.get("/404", (c) => {
  return c.html(
    <p>404</p>
  );
});

app.get("/dashboard/add-new-registration", async (c) => {
  // const reservationId = c.req.param('reservationId');
  // const data = await getParticipantData(participantId, reservationId);

  // if (data === "redirect") {
  //   return c.redirect("/404");
  // }

  return c.html(
    <Page />
  );
});

const EventDetails = ({
  eventName,
  eventDate,
  waveStartTime,
}: {
  eventName: string;
  eventDate: string;
  waveStartTime: string;
}) => {
  return (
    <div>
      <p>{eventName}</p>
      <p>{eventDate}</p>
      <p>{waveStartTime}</p>
    </div>
  );
};

app.get("/edit-event", async (c) => {
  return c.html(<EventSearch />);
});

const EventSummary = ({ wave }: { wave: Wave }) => {
  return (
    <div id="event-summary">
      <EventDetails
        eventName={wave.eventName}
        eventDate={wave.eventDate}
        waveStartTime={wave.waveStartTime}
      />
      <button hx-get="/edit-event" hx-target="#event-summary" hx-swap="outerHTML">
        Edit Event
      </button>
    </div>
  );
};

type Waves = NonNullable<Awaited<ReturnType<typeof handleSearchEvents>>>;
type Wave = Waves[number];

const WaveSelect = ({ waves }: { waves: Waves; }) => (
  <select name="waveCode">
    <option value="">Select wave</option>
    {waves.map((wave) => {
      return (
        <option
          value={JSON.stringify(wave)}
          disabled={!wave.availability || !wave.orderable}
        >
          {!wave.orderable
            ? `${wave.waveStartTime} Tickets are not available`
            : `${wave.waveStartTime} (${wave.availability} tickets left)`}
        </option>
      );
    })}
  </select>
);

app.get("/dashboard/add-new-registration/:waveCode", async (c) => {
  const waveCode = c.req.param("waveCode");
  const eventCode = waveCode.substring(0, waveCode.length - 3);
  const data = await handleSearchEvents(eventCode);
  
  if (!data) {
    return c.redirect("/dashboard/add-new-registration");
  }

  const wave = findWave(waveCode, data); 
  
  if (!wave) {
    return c.redirect("/dashboard/add-new-registration");
  }

  return c.html(
    <FormPage wave={wave} />
  );
});

const Form = ({ wave }: { wave: Wave; }) => (
  <>
    <EventSummary wave={wave} />
    <div hx-swap-oob="outerHTML:#ticket-selection">
      <p>Form for {wave.waveCode}</p>
    </div>
  </>
);

// Might be a simpler way to keep this de-duped
const FormPage: FC = ({ wave }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width" />
        <script src="https://cdn.jsdelivr.net/npm/htmx.org@2.0.6/dist/htmx.min.js"></script>
        <title>Cancer Research UK Events Admin Portal</title>
      </head>
      <body>
        <h1>Event Registration</h1>
        <main>
          <section>
            <h2>1 .  Select Event</h2>
            <EventSearch wave={wave} />
          </section>
          <section>
            <h2>2 .  Ticket Selection</h2>
            <div id="ticket-selection">
              <p>Form for {wave.waveCode}</p>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
};

app.post("/get-form", async (c) => {
  const formData = await c.req.formData();
  const waveData = formData.get("waveCode")?.toString() ?? "{}";
  const wave = JSON.parse(waveData) as Wave;
  
  c.header("HX-Push-Url", `/dashboard/add-new-registration/${wave.waveCode}`);

  return c.html(
    <Form wave={wave} />
  );
});

app.post("/get-event", async (c) => {
  const formData = await c.req.formData();
  const eventCode = formData.get("event-code")?.toString();
  const data = eventCode ? await handleSearchEvents(eventCode) : "";
  return c.html(
    <form
      id="event-code-form"
      hx-post={!!data ? "/get-form" : "/get-event"}
      hx-target="#event-code-form"
      hx-swap="outerHTML"
    >
      <label>
        <span>Event Code</span>
        <input name="event-code" type="text" value={eventCode} required />
      </label>
      <button type={!!data ? "button" : "submit"}>
        Search code
      </button>
      { !!data
        ? (
          <>
          <label>
            <span>Select wave</span>
            <WaveSelect waves={data} />
          </label>
          <button type="submit">
            Select this event
          </button>
          </>
        ) : (
        <span>Wave not found</span>
        )
      }
    </form>
  );
});

const EventSearch = ({ wave }: { wave?: Wave; }) => {
  return (
    <div className="event-search-container">
      {wave ? (
        <EventSummary wave={wave} />
      ) : (
        <form
          id="event-code-form"
          hx-post="/get-event"
          hx-target="#event-code-form"
          hx-swap="outerHTML"
        >
          <label>
            <span>Event Code</span>
            <input name="event-code" type="text" required />
          </label>
          <button type="submit">
            Search code
          </button>
        </form>    
      )}
    </div>
  );
};

const Page: FC = () => {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width" />
        <script src="https://cdn.jsdelivr.net/npm/htmx.org@2.0.6/dist/htmx.min.js"></script>
        <title>Cancer Research UK Events Admin Portal</title>
      </head>
      <body>
        <h1>Event Registration</h1>
        <main>
          <section>
            <h2>1 .  Select Event</h2>
            <EventSearch />
          </section>
          <section>
            <h2>2 .  Ticket Selection</h2>
            <div id="ticket-selection"></div>
          </section>
        </main>
      </body>
    </html>
  );
};

export default app;
