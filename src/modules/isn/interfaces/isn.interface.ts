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

export interface IsnSlotItem {
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
  slots: IsnSlotItem[];
  message?: string;
}

export interface IsnClientLookupResponse {
  status: string;
  client: any;
  message?: string;
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
  clientuuid: string;
  buyersagentuuid?: string;
  notes?: Array<{ text: string; owner?: string }>;
}
