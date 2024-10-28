const PROXY_API = 'https://proxy-pr-1064.int.events.app.crnet.org';

type ConsentResponse = {
  showMarketingConsent: boolean;
  reservation: {
    eventName: string;
    waveDate: string;
  };
  participant: {
    forename: string;
    participantReference: string;
  };
};

export async function getParticipantData(
  participantId: string,
  reservationId: string,
): Promise<ConsentResponse | "redirect"> {
  try {
    const res = await fetch(
      `${PROXY_API}/get-reservation-participant/${reservationId}/${participantId}`,
      {
        cache: 'no-cache',
      }
    );
    const { status } = res;

    if (!res.ok) {
      throw new Error(`FetchError ${status}`);
    }

    const data: ConsentResponse = await res.json();

    return data;
  } catch (error: any) {
    console.log(error);
    return "redirect";
  }
}

// FIXME: This is currently not being used in the code and the entire function was copied temporarily to avoid a bundle step
export async function updateSuppressionPreferences(
  data: any,
  participantId: string,
  reservationId: string
): Promise<boolean> {
  try {
    const res = await fetch(
      `${PROXY_API}/save-participant-consent/${reservationId}/${participantId}`,
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
  } catch (error: any) {
    console.log("Unable to update suppressions")
    return false;
  }
}
