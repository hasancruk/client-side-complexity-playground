import { Hono } from 'hono';
import type { FC } from 'hono/jsx';
import { getParticipantData } from './data.js';

const app = new Hono();

app.get('/404', (c) => {
  return c.html(
    <p>404</p>
  );
});

app.get('/consent-additional-participants/:reservationId/:participantId', async (c) => {
  const reservationId = c.req.param('reservationId');
  const participantId = c.req.param('participantId');
  const data = await getParticipantData(participantId, reservationId);

  if (data === "redirect") {
    return c.redirect("/404");
  }

  return c.html(
    <ConsentPage 
      data={data} 
      participantId={participantId} 
      reservationId={reservationId} 
    />
  );
});


const Layout: FC = ({ title, children }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width" />
        <title>{title}</title>
      </head>
      <body>
        <h1>{title}</h1>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
};

const ConsentPage: FC = ({ data, participantId, reservationId }) => {
  return (
    <Layout title="consent">
      <ConsentForm data={{ ...data, participantId, reservationId }} />
    </Layout>
  );
};

const ConsentForm: FC = ({ data }) => {
  return (
    <section>
      <header>
        <h2>{data.reservation.eventName}</h2>
        <p>{data.reservation.waveDate}</p>
      </header>
      <h2>Your Details</h2>
      <div>
        <p>
          Hi {data.participant.forename}, this is your reference:{' '}
          <b>{data.participant.participantReference}</b>
        </p>
        <a href="#">Something wrong? Contact Us</a>
      </div>
      {data.showMarketingConsent ? (
        <ConsentFormFields
          participantId={data.participantId}
          reservationId={data.reservationId}
        />
      ) : (
        ''
      )}
    </section>
  );
};

const ConsentFormFields: FC = ({ participantId, reservationId }) => {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{ __html: `
          [data-display="none"] {
            display: none;
          }

          [data-display="block"] {
            display: block;
          }
        `}}
      />
      <h3 data-display="none" data-thanks-message>
        Thank you, you have submitted your preferences!
      </h3>
      <form 
        name="primary-page" 
        data-display="block"
      >
        <label>
          <span>Your preferences</span>
          <input type="text" name="preferences" />
        </label>
        <button>
          Confirm
        </button>
      </form>
      <script
        dangerouslySetInnerHTML={{ __html: `
          const participantId = "${participantId}";
          const reservationId = "${reservationId}";
          const form = document.querySelector("form[name='primary-page']");
          const submit = document.querySelector("form > button");

          const thanksMessage = document.querySelector("[data-thanks-message]");
          
          const setApplied = () => {
            thanksMessage.setAttribute("data-display", "block");
            form.setAttribute("data-display", "none");
          };

          form.addEventListener("submit", async (e) => {
            e.preventDefault();
            submit.setAttribute("disabled", "");
            submit.textContent = "Loading...";

            const requestBody = ["something", "potato", "privacy"];

            console.log(requestBody);

            const response = await updateSuppressionPreferences(
              requestBody,
              participantId,
              reservationId
            );
            if (response) {
              setApplied();
            } else {
              submit.setAttribute("disabled", "false");
              submit.textContent = "Confirm";
            }
          });

          const PROXY_API = 'https://proxy-pr-1064.int.events.app.crnet.org';
          async function updateSuppressionPreferences(
            data,
            participantId,
            reservationId
          ) {
            try {
              const res = await fetch(
                \`\${PROXY_API}/save-participant-consent/\${reservationId}/\${participantId}\`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data),
                }
              );
              if (!res.ok) {
                throw new Error("Couldn't submit consent");
              }
              return res.json();
            } catch (error) {
              console.log("Unable to update suppressions")
              return false;
            }
          }
        `}}
      />
    </>
  );
};

export default app;
