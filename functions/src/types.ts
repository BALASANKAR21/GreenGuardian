export interface UserProfile {
  uid: string;
  email: string;
  city: string;
  preferences: any;
}

export interface Plant {
  id: string;
  name: string;
  climate: string[];
  airPurifying: boolean;
  waterNeeds: string;
  // ...other fields
}
