export interface IsnServiceFee {
  id: string;
  name: string;
  amount: number;
}

export interface IsnServiceItem {
  id: string;
  name: string;
  description?: string;
  inspectiontypeid?: string;
  visible?: string;
  ancillary?: string;
  fees?: IsnServiceFee[];
  inspectors?: string[];
}

export interface IsnPackageItem {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  show: boolean;
  sequence?: number;
  services: string[];
}

export interface IsnOrderType {
  id: string;
  name: string;
  active?: boolean;
}

export interface IsnUserMe {
  id: string;
  displayname: string;
  inspector: string;
  email?: string;
  officeuuid?: string;
}

export interface IsnRawSlotWindow {
  userid: string;
  start: string;
  end: string;
  userdisplay: string;
  userfirst?: string;
  userlast?: string;
}

export interface IsnAvailableSlotsResponse {
  status: string;
  count: number;
  zip: string;
  daysahead: number;
  offset?: number;
  services?: string[];
  slots: IsnRawSlotWindow[];
  message?: string;
}

export interface BookableSlot {
  date: string;
  formattedTime: string;
  startDateTime: string;
  endDateTime: string;
  inspectorId: string;
  inspectorName: string;
  durationMinutes: number;
}

export interface IsnClient {
  id: string;
  firstname: string;
  lastname: string;
  emailaddress: string;
  mobilephone?: string;
  phone?: string;
}

export interface IsnAgent {
  id: string;
  firstname?: string;
  lastname?: string;
  name?: string;
  emailaddress: string;
  mobilephone?: string;
  agency?: string;
}

export interface IsnOrderFee {
  feeid: string;
  name?: string;
  value: number;
}

export interface IsnOrderPayload {
  address1: string;
  city: string;
  state: string;
  zip: string;
  squarefeet?: number;
  yearbuilt?: number;
  datetime: string;
  duration?: number;
  inspector1uuid: string;
  ordertypeuuid?: string;
  services: string[];
  packages?: Array<{ package: string }>;
  fees?: Array<{ feeid: string; value: number }>;
  clientuuid: string;
  buyersagentuuid?: string;
  sellersagentuuid?: string;
  officeuuid?: string;
  donotcalculateservicefees?: boolean;
  sendemailevents?: boolean;
  sendsmsevents?: boolean;
  notes?: Array<{ text: string; owner?: string }>;
}

export interface IsnCreatedOrderResponse {
  status: string;
  id: string;
  oid: number;
  modified?: string;
  message?: string;
}

export interface IsnOrderDetails {
  id: string;
  oid: number;
  datetime: string;
  duration: number;
  scheduleddatetime?: string;
  inprogress?: boolean;
  inspector1: string;
  client: string;
  buyersagent?: string;
  ordertype: string;
  services: any[];
  fees: any[];
  totalfee: number;
}
