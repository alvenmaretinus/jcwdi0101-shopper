import { AppError } from "../error/AppError";
import { BadRequestError } from "../error/BadRequestError";
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

type DistrictResponse = { data?: Array<{ id: string }> };

const komerceBaseUrl = process.env.KOMERCE_API_URL!;
const komerceKey = process.env.KOMERCE_API_KEY!;
if (!komerceBaseUrl || !komerceKey) {
  throw new Error("KOMERCE_API_URL or KOMERCE_API_KEY is not defined");
}
export class ShippingCostService {
  static async getShippingCost(inputData: GetShippingCostInput) {
    const originDistrictId = await this.getDistrictIdByPostCode(
      inputData.originPostCode,
    );
    const destinationDistrictId = await this.getDistrictIdByPostCode(
      inputData.destinationPostCode,
    );

    if (!originDistrictId || !destinationDistrictId) {
      throw new BadRequestError("Invalid post code");
    }
    const queryParams = new URLSearchParams({
      shipper_destination_id: originDistrictId,
      receiver_destination_id: destinationDistrictId,
      weight: String(inputData.weight),
      item_value: String(inputData.itemValue),
    });
    const res = await fetch(`${komerceBaseUrl}/calculate?${queryParams}`, {
      method: "GET",
      headers: {
        "x-api-key": komerceKey,
      },
    });
    if (!res.ok) {
      console.error("Failed to calculate shipping cost");
      throw new AppError({
        message: "Internal server error",
        statusCode: 500,
      });
    }
    const data = await res.json();
    return data.data as ShippingCostData;
  }

  static async getDistrictIdByPostCode(postCode: string) {
    const queryParam = new URLSearchParams({
      keyword: postCode,
    });
    const res = await fetch(
      `${komerceBaseUrl}/destination/search?${queryParam}`,
      {
        method: "GET",
        headers: {
          "x-api-key": komerceKey,
        },
      },
    );
    if (!res.ok) {
      throw new AppError({
        message: "Internal server error",
        statusCode: 500,
      });
    }
    const data: DistrictResponse = await res.json();
    const id = data.data?.[0]?.id;

    return id;
  }
}