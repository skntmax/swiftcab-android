/**
 * Socket Event Constants
 * Centralized socket event names for consistency
 */

export const SOCKET_EVENTS = {

  SEARCH_CUSTOMER :"SEARCH_CUSTOMER" ,
  EV_DRIVER_LIVE_LOCATION:"EV_DRIVER_LIVE_LOCATION",
  EV_DRIVER_LOGGED_OUT:"EV_DRIVER_LOGGED_OUT",
  NEW_RIDE_REQUEST:"NEW_RIDE_REQUEST",
  DRIVER_ACCEPTED_THE_RIDE:"DRIVER_ACCEPTED_THE_RIDE",
  CAB_BOOK:"CAB_BOOK",
  CAB_BOOKED:"CAB_BOOKED",
  RIDE_INTIATED_BY_DRIVER:"RIDE_INTIATED_BY_DRIVER",
  // on validatione error
  UNAUTHORIZED:"UNAUTHORIZED",

  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  RIDE_UPDATE: 'ride-update',
  
} as const;

export const USER_ROLES = {
  superAdmin: "super-admin",
  admin: "admin",
  salesManager: "sales-manager",
  salesExecutive: "sales-executive",
  salesRepresentative: "sales-representative",
  accountManager: "account-manager",
  marketingManager: "marketing-manager",
  marketingExecutive: "marketing-executive",
  marketingSpecialist: "marketing-specialist",
  customerSupportManager: "customer support-manager",
  supportAgent: "support-agent",
  helpdeskAgent: "helpdesk-agent",
  technicalSupportEngineer: "technical support-engineer",
  operationsManager: "operations-manager",
  financeManager: "finance-manager",
  crmDeveloper: "crm-developer",
  crmAnalyst: "crm-analyst",
  partnerManager: "partner-manager",
  vendorCoordinator: "vendor-coordinator",
  customer: "customer",
  owner: "owner",
  ['driver-partner']:"driver-partner"  
} as const;

export type SocketEvent = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

