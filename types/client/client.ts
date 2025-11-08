import { UseMutationResult } from "@tanstack/react-query";
import type { ApiError, AddressDto } from "../common";
import type { ClientOrder } from "./clientOrder";

export type Client = {
  id: number;
  name: string;
  address?: AddressDto;
  email: string;
  phoneNumber: string;
  orders?: ClientOrder[];
  createdAt: string;
  updatedAt: string;
}

export interface ClientRequest {
  name: string;
  address?: AddressDto;
  email: string;
  phoneNumber: string;
}

export type CreateClientMutation = UseMutationResult<Client, ApiError, ClientRequest, unknown>;
export type UpdateClientMutation = UseMutationResult<Client, ApiError, { id: number; data: ClientRequest }, unknown>;
export type DeleteClientMutation = UseMutationResult<unknown, ApiError, number, unknown>;

export interface UpdateClientRequest extends Partial<ClientRequest> {
    id: number;
}

export type ClientResponse = Client;