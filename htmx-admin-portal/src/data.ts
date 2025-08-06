import { format, parse, parseISO } from "date-fns";
import { type EventResponse, type EventAvailabilityProxyResponse } from "./types.js";

const PROXY_API = "https://proxy-int.int.events.app.crnet.org";

export function formatDate(dateString: string, waveTime: string) {
  // Adding a Z to indicate UTC time so that that function can handle BST times
  const datePart = parseISO(`${dateString}Z`).toLocaleString("en-GB", {
    timeZone: "Europe/London",
  });
  const dateTime = `${datePart.split(",")[0]} ${waveTime}`;
  const parsedDateTime = parse(dateTime, "dd/MM/yyyy HH:mm:ss", new Date());
  const date = format(parsedDateTime, "EEEE d MMMM yyyy");
  const time = format(parsedDateTime, "H:mm");
  return { date, time };
}

export async function getEventData(eventCode: string): Promise<EventResponse> {
  try {
    const res = await fetch(`${PROXY_API}/select/event/${eventCode}`);

    if (!res.ok) {
      throw new FetchError(res.status, await res.json());
    }

    const data = await res.json();
    return data;
  } catch (error) {
    return error as EventResponse;
  }
}

export function getEventAvailability({
  eventCode,
  waves,
}: {
  eventCode: string;
  waves: string[];
}): EventAvailabilityProxyResponse {
  // return mock event availability until work is completed to create getEventAvailability in events proxy
  return {
    id: eventCode,
    eventOrderable: true,
    waves: waves.map((wave) => ({
      waveId: wave,
      orderable: true,
      availability: Math.floor(Math.random() * 100),
    })),
  };
}

export async function handleSearchEvents(eventCode: string) {
  const eventData = await getEventData(eventCode.trim());
  if (eventData instanceof FetchError || eventData instanceof Error) {
    // setErrorMessage(
    //   eventData.message ?? "An error occurred while fetching event data.",
    // );
    console.error(
      eventData.message ?? "An error occurred while fetching event data.",
    );
    return;
  }
  if (eventData._propositionCode.includes("SPORTS")) {
    // setErrorMessage("Registrations for sports events cannot be added here");
    console.error("Registrations for sports events cannot be added here");
    return;
  }

  const waveAvailability = getEventAvailability({
    eventCode,
    waves: eventData.waves.map((wave) => wave.id),
  });
  if (waveAvailability instanceof FetchError || eventData instanceof Error) {
    // setErrorMessage("An error occurred while fetching event data.");
    console.error("An error occurred while fetching event data.");
    return;
  }
  if (!waveAvailability.eventOrderable) {
    // setErrorMessage("Tickets are not available for this event.");
    console.error("Tickets are not available for this event.");
    return;
  }
  const waveData = eventData.waves.map((wave) => {
    const waveDateTime = formatDate(wave.startDateTime, wave.waveTime);
    return {
      waveId: wave.id,
      eventName: eventData.eventName,
      eventDate: waveDateTime.date,
      waveCode: wave.waveCode,
      waveStartTime: waveDateTime.time,
      availability: waveAvailability.waves.filter(
        (w) => w.waveId === wave.id,
      )[0].availability,
      orderable: waveAvailability.waves.filter((w) => w.waveId === wave.id)[0]
        .orderable,
    };
  });
  return waveData;
}

export function findWave(waveCode: string, waves: NonNullable<Awaited<ReturnType<typeof handleSearchEvents>>>) {
  const waveData = waves?.find((wave) => wave.waveCode === waveCode);
  return waveData;
}

export class FetchError extends Error {
  constructor(
    public status: number,
    public errorData: { error: string },
  ) {
    super(`FetchError ${status} ${JSON.stringify(errorData, null, 4)}`);
    this.name = "FetchError";
    this.status = status;
    this.message = errorData.error;
  }
}
