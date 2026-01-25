import { GetShippingCostInput } from "../schema/shipping-cost/GetShippingCostSchema";

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

type ShippingCostData = {
  calculate_reguler: ShippingCostItem[];
  calculate_cargo: ShippingCostItem[];
  calculate_instant: ShippingCostItem[];
};

export class ShippingCostService {
  static async getShippingCost(inputData: GetShippingCostInput) {
    const originDistrictId = await this.getDistrictIdByPostCode(
      inputData.originPostCode
    );
    const destinationDistrictId = await this.getDistrictIdByPostCode(
      inputData.destinationPostCode
    );
    const queryParams = new URLSearchParams({
      shipper_destination_id: originDistrictId,
      receiver_destination_id: destinationDistrictId,
      weight: String(inputData.weight),
      item_value: String(inputData.itemValue),
    });
    const res = await fetch(
      `https://api-sandbox.collaborator.komerce.id/tariff/api/v1/calculate?${queryParams}`,
      {
        method: "GET",
        headers: {
          "x-api-key": process.env.KOMERCE_API_KEY!,
        },
      }
    );
    const data = await res.json();
    return data.data as ShippingCostData;
  }

  static async getDistrictIdByPostCode(postCode: string) {
    const queryParam = new URLSearchParams({
      keyword: postCode,
    });
    const res = await fetch(
      `https://api-sandbox.collaborator.komerce.id/tariff/api/v1/destination/search?${queryParam}`,
      {
        method: "GET",
        headers: {
          "x-api-key": process.env.KOMERCE_API_KEY!,
        },
      }
    );

    const data = await res.json();
    const { id } = data.data[0] as {
      id: string;
    };
    return id;
  }
}
