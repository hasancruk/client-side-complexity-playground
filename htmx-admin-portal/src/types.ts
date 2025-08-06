export type EventAvailabilityProxyResponse = {
  id: string;
  eventOrderable: boolean;
  waves: {
    waveId: string;
    orderable: boolean;
    availability: number;
  }[];
};

export const mockEventAvailability: EventAvailabilityProxyResponse = {
  id: "event-123",
  eventOrderable: false,
  waves: [
    {
      waveId: "W01",
      orderable: true,
      availability: 80,
    },
    {
      waveId: "W02",
      orderable: true,
      availability: 55,
    },
  ],
};

export interface EventResponse {
  id: string;
  eventName: string;
  eventCode: string;
  previousEventCode: string | null;
  organiserCategory: string;
  eventStatus: string;
  cancellationType: string | null;
  cancellationReason: string | null;
  cancellationReasonDescription: string | null;
  description: string;
  registrantDeclaration: string;
  criticalAmendMessage: string | null;
  owner: string | null;
  startDateTime: string;
  endDateTime: string;
  fundraisingRestriction: string | null;
  fundraisingProduct: string | null;
  eventTypes: string[];
  venueInfoRequired: boolean;
  venueInfo: VenueInfo | null;
  confirmationPageSettings: ConfirmationPageSettings;
  distance: number;
  distanceUnit: string;
  financialYear: string;
  runningNumberRequired: boolean;
  fundraisingPageTypeReference: string | null;
  paidTicketsRequired: boolean;
  bankAccountCode: string;
  productCode: string;
  vouchersCanBeApplied: boolean;
  applicationGroupReference: string | null;
  allowedOpenWaves: number | null;
  eventPageUrl: string;
  _propositionCode: string;
  _propositionReference: string;
  nextEventCode: string | null;
  partner: string | null;
  keyContact: string | null;
  contractUrl: string | null;
  onTheDayPresence: string | null;
  personalDeclaration: string;
  sendCriticalAmendMessageEmail: boolean;
  timeHidden: boolean;
  dateHidden: boolean;
  eventDate: string;
  endDateTimeInterval: string;
  venueReference: string;
  subPropositionReference: string;
  subPropositionCode: string;
  incomeRestriction: string | null;
  fundraisingEnabled: boolean;
  waves: Omit<Wave, "orderable">[];
  searchable: boolean;
  applicationGroupDetails: ApplicationGroupDetails | null;
};

type ApplicationGroupDetails = {
  id: string;
  active: boolean;
  owner: string;
  name: string;
  applicationType: string;
  deferralSupported: boolean;
  eventReference: string;
  thirdPartyCodesReusable: boolean;
  thirdPartyInstructions: string;
  thirdPartyInstructionsTeam: string | null;
  thirdPartyInstructionsUrl: string;
  cancellationInstructions: string;
  applicationFormStart: string | null;
  applicationFormEnd: string | null;
  applicationReviewMonth: number | null;
};

interface CapacityGroup {
  id: string;
  capacity: number;
  ticketTypes: TicketType[];
};

interface ConfirmationPageSettings {
  pageTitle: string | null;
  pageAdditionalInfo: string | null;
};

interface Constraint {
  id: string;
  registrationOpenInterval: string;
  registrationCloseInterval: string;
  registrationOpenDate: string;
  registrationCloseDate: string;
  maximumTickets: number;
  minimumTickets: number;
  salesChannels: string[];
};

interface Requirement {
  id: string;
  requireEmergencyContact: boolean;
  requireFundraisingRestrictions: boolean;
  requireIncomeRestrictions: boolean;
  requireParentalConsent: boolean;
  requireParentalConsentContact: boolean;
  requireEventKit: string;
  requireTshirtName: boolean;
  requireMotivation: boolean;
  requireFundraisingTarget: boolean;
  requireMinimumFundraisingTarget: boolean;
  minimumFundraisingTarget: number | null;
  fundraisingTargetSupportingCopy: string | null;
  requireAgeRestriction: boolean;
  ageRestrictionApplicableOn: string | null;
  minimumAge: number | null;
  maximumAge: number | null;
  requireGender: boolean;
  defaultGender: string | null;
  requireTitle: boolean;
};

interface TicketType {
  id: string;
  ticketTypeName: string;
  cost: number;
  description: string | null;
  constraint: Constraint;
  requirement: Requirement;
};

interface VenueInfo {
  id: string;
  meetingPointLongitude: number;
  meetingPointLatitude: number;
  meetingPointDescription: string;
  courseDescription: string;
  accessibilityDescription: string | null;
  travelNotes: string;
  spectatorAccessNotes: string;
  disabilityAccessible: boolean;
  parkingAvailable: boolean;
  dogsAllowed: boolean;
  suitableForPushchairs: boolean;
  showersAvailable: boolean;
  toiletsAvailable: boolean;
  bagDropAvailable: boolean;
  refreshmentsAvailable: boolean;
};

export interface Wave {
  id: string;
  orderingNumber: number;
  waveCode: string;
  waveStatus: string;
  cancellationType: string | null;
  cancellationReason: string | null;
  cancellationReasonDescription: string | null;
  sendCriticalAmendMessageEmail: boolean;
  criticalAmendMessage: string | null;
  startDateTime: string;
  waveTime: string;
  runningNumberPrefix: number | null;
  runningNumberStart: number | null;
  capacityGroups: CapacityGroup[];
  orderable: boolean;
};
