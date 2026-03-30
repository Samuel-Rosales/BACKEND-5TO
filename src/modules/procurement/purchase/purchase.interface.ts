import { StatusPurchase } from "@prisma/client";

export interface CreatePurchaseItemDto {
    supplyId: number;
    quantity: number;
    unit_cost: string | number;
    expiration_date?: string | Date;
}

export interface CreatePurchaseDto {
    supplierId: number;
    userId: number;
    exchangeRateId?: number;
    status: StatusPurchase;
    reference?: string;
    observation?: string;
    items: CreatePurchaseItemDto[];
    payments: {
        paymentMethodId: number;
        amount: string | number;
    }[];
}

export interface UpdatePurchaseDto {
    supplierId?: number;
    userId?: number;
    exchangeRateId?: number;
    status?: StatusPurchase;
    reference?: string;
    observation?: string;
    discount?: string | number;
}
