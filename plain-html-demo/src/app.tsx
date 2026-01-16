import { Hono } from 'hono';
import type { FC } from 'hono/jsx';
import { getParticipantData, updateSuppressionPreferences } from './data.js';

const app = new Hono();

app.get('/404', (c) => {
  return c.html(
    <p>404</p>
  );
});

async function consentGetHandler(c: any) {
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
}

app.get('/consent-additional-participants/:reservationId/:participantId', consentGetHandler);

const cache = new Set();

app.post('/consent-additional-participants/:reservationId/:participantId', async (c) => {
  const reservationId = c.req.param('reservationId');
  const participantId = c.req.param('participantId');

  if (c.req.header("Content-Type") === "application/x-www-form-urlencoded") {
    if (cache.has(`${reservationId}/${participantId}`)) {
      return await consentGetHandler(c);
    }

    const formData = await c.req.formData();
    const data = formData.get("preferences");
    const { ok } = await updateSuppressionPreferences(
      data,
      participantId,
      reservationId,
    );
    if (!ok) {
      c.status(400);
      return c.html(
        <ErrorPage />
      );
    }

    cache.add(`${reservationId}/${participantId}`);
    return c.html(
      <ThankYouPage />
    );
  } else {
    const data = await c.req.json();
    const { ok, message } = await updateSuppressionPreferences(
      data,
      participantId,
      reservationId,
    );
    if (!ok) {
      c.status(404);
      return c.json(message);
    }
    return c.json(message);
  }
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

const ThankYouPage = () => {
  return (
    <Layout title="consent">
      <section>
        <h3 data-thanks-message>
          Thank you, you have submitted your preferences!
        </h3>
      </section>
    </Layout>
  );
};

const ErrorPage = () => {
  return (
    <Layout title="consent">
      <section>
        <p>Something went wrong updating your preferences</p>
      </section>
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
        method="post"
        data-display="block"
      >
        <label>
          <span>Your preferences</span>
          <input type="text" name="preferences" />
        </label>
        <input type="hidden" id="reservationId" name="reservationId" value={reservationId} />
        <input type="hidden" id="participantId" name="participantId" value={participantId} />
        <button>
          Confirm
        </button>
      </form>
      <script
        dangerouslySetInnerHTML={{ __html: `
          const form = document.querySelector("form[name='primary-page']");
          const submit = document.querySelector("form > button");

          const thanksMessage = document.querySelector("[data-thanks-message]");
          
          const setApplied = () => {
            thanksMessage.setAttribute("data-display", "block");
            form.setAttribute("data-display", "none");
          };

          form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const data = new FormData(e.target);
            const participantId = data.get("participantId");
            const reservationId = data.get("reservationId");
            const preferences = data.get("preferences");
            const actionUrl = document.baseURI;

            submit.setAttribute("disabled", "");
            submit.textContent = "Loading...";

            const requestBody = [preferences];

            console.log(requestBody);

            const response = await updateSuppressionPreferences(
              requestBody,
              actionUrl,
            );
            if (response) {
              setApplied();
            } else {
              submit.setAttribute("disabled", "false");
              submit.textContent = "Confirm";
            }
          });

          async function updateSuppressionPreferences(
            data,
            actionUrl,
          ) {
            try {
              const res = await fetch(actionUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
              });
              if (!res.ok) {
                throw new Error("Couldn't submit consent");
              }
              const { message } = await res.json();
              return message;
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
