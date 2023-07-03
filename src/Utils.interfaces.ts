import { PropertyType } from '@prisma/client';

export interface SignUpParams {
  name: string;
  phone: string;
  email: string;
  password: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface GetHomesParams {
  city?: string;
  price: {
    lte?: number;
    gte?: number;
  };
  propertyType?: PropertyType;
}

export interface CreateHomeParams {
  address: string;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  city: string;
  price: number;
  landSize: number;
  propertyType: PropertyType;
  images: { url: string }[];
}

export interface whichUser {
  id: number;
  name: string;
  iat: number;
  exp: number;
}
