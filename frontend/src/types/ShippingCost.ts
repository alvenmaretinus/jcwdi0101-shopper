type ShippingCostItem = {
    shipping_name: string;
    service_name: string;
    weight: number;
    is_cod: boolean;
    shipping_cost: number;
    shipping_cashback: number;
    shipping_cost_net: number;
    grandtotal: number;
    service_fee: number;
    net_income: number;
    etd: string;
};

export type ShippingCost = {
    calculate_reguler: ShippingCostItem[];
    calculate_cargo: ShippingCostItem[];
    calculate_instant: ShippingCostItem[];
};