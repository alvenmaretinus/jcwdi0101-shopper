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
    const originDistrictId = await this.getDistrictIdByPostCode(inputData.originPostCode);
    const destinationDistrictId = await this.getDistrictIdByPostCode(inputData.destinationPostCode);

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
      const body = await res.text().catch(() => "<no-body>");
      console.error("Failed to calculate shipping cost", {
        status: res.status,
        statusText: res.statusText,
        body,
        url: `${komerceBaseUrl}/calculate?${queryParams}`,
      });
      throw new AppError({
        message: "Internal server error",
        statusCode: 500,
      });
    }

    const data = await res.json().catch((e) => {
      console.error("Failed to parse shipping cost response as JSON", e);
      throw new AppError({ message: "Internal server error", statusCode: 500 });
    });
    return data.data as ShippingCostData;
  }

  static async getDistrictIdByPostCode(postCode: string) {
    const queryParam = new URLSearchParams({
      keyword: postCode,
    });
    const res = await fetch(`${komerceBaseUrl}/destination/search?${queryParam}`, {
      method: "GET",
      headers: {
        "x-api-key": komerceKey,
      },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "<no-body>");
      console.error("Failed to lookup district by post code", {
        status: res.status,
        statusText: res.statusText,
        body,
        url: `${komerceBaseUrl}/destination/search?${queryParam}`,
      });
      throw new AppError({ message: "Internal server error", statusCode: 500 });
    }

    const data: DistrictResponse = await res.json().catch((e) => {
      console.error("Failed to parse district lookup response as JSON", e);
      throw new AppError({ message: "Internal server error", statusCode: 500 });
    });
    const id = data.data?.[0]?.id;

    if (!id) {
      console.warn("No district id found for post code", postCode, { url: `${komerceBaseUrl}/destination/search?${queryParam}` });
    }

    return id;
  }
}
