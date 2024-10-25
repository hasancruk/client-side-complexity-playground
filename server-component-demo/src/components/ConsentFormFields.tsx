import { useState, useTransition } from "react";

import { updateSuppressionPreferences } from "../data";

export const ConsentFormFields = ({
  participantId,
  reservationId,
}: {
  participantId: string;
  reservationId: string;
}) => {
  const [isPending, startTransition] = useTransition();
  const [applied, setApplied] = useState(false);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    startTransition(async () => {
      const requestBody = ["something", "potato", "privacy"];

      console.log(requestBody);

      const response = await updateSuppressionPreferences(
        requestBody,
        participantId,
        reservationId
      );
      if (response) {
        setApplied(true);
      }
    });
  };

  return (
    <>
      {applied ? (
        <h3>
          Thank you, you have submitted your preferences!
        </h3>
      ) : (
        <form name="primary-page" onSubmit={handleSubmit}>
          <label>
            <span>Your preferences</span>
            <input type="text" name="preferences" />
          </label>
          <button disabled={isPending || applied}>
            {isPending ? 'Loading...' : 'Confirm'}
          </button>
        </form>
      )}
    </>
  );
};
