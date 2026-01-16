import { axiosInstance } from "@/lib/axiosInstance";
import { Store } from "@/types/Store";

export const getStores = async () => {
  try {
    const res = await axiosInstance.get<(Store & { employeeCount: number })[]>(
      "/stores/"
    );
    return res.data;
  } catch (error) {
    console.log({ aaaaaaaaaaaa: error });
  }
};
