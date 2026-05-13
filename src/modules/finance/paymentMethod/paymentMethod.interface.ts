import { Currency } from "@prisma/client/edge";

export interface CreatePaymentMethodDto {
    name: string;
    type: string;
    currency: Currency;
    is_active?: boolean;
}

export interface UpdatePaymentMethodDto {
    name?: string;
    type?: string;
    currency?: Currency;
    is_active?: boolean;
}
