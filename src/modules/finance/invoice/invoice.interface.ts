export interface CreateInvoiceDetailDto {
    productId?: number;
    description: string;
    quantity: number;
    unit_price: string | number;
    taxId: number;
    is_commissionable?: boolean;
}

export interface CreateInvoiceDto {
    patientId: number;
    receptionistId: number;
    exchangeRateId?: number;
    taxId: number;
    statusId: number;
    total_usd?: string | number;
    total_bs?: string | number;
    appointmentId?: number;
    // patient: {
    //     appointment: {
    //         id: number;
    //         doctor: {
    //             id: number;
    //             name: string;
    //             specialty: {
    //                 id: number;
    //                 name: string;
    //                 specialty: {
    //                     id: number;
    //                     name: string;
    //                     consultation_price: number;
    //                     commission_percentage: number;
    //                 };
    //             };
    //         };
    //     }
    // }
}

export interface UpdateInvoiceDto {
    exchangeRateId?: number;
    statusId?: number;
}
