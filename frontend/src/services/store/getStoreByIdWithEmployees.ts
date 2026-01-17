import { axiosInstance } from "@/lib/axiosInstance";
import {
  GetStoreByIdInput,
  GetStoreByIdSchema,
} from "@/schemas/store/GetStoreByIdSchema";
import { User } from "@/types/User";
import { Store } from "@/types/Store";
import { toast } from "sonner";

export const getStoreByIdWithEmployees = async (
  inputData: GetStoreByIdInput
) => {
  const parseResult = GetStoreByIdSchema.safeParse(inputData);

  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0].message;
    toast.error(firstError || "Invalid input");
    throw new Error(firstError);
  }

  const res = await axiosInstance.get<Store & { employees: User[] }>(
    `/stores/${inputData.id}/employees`
  );
  // TODO: Delete Mock
  // res.data.employees = mockEmployees;

  return res.data;
};

const mockEmployees: User[] = [
  {
    id: "emp_001",
    email: "alice@example.com",
    profileUrl: "https://i.pravatar.cc/150?img=1",
    referralCode: "REF123",
    storeId: "store_01",
    employeeJoinedAt: new Date("2024-05-01T09:00:00Z").toISOString(),
  },
  {
    id: "emp_002",
    email: "bob@example.com",
    profileUrl: null,
    referralCode: "REF456",
    storeId: "store_01",
    employeeJoinedAt: new Date("2024-06-15T14:30:00Z").toISOString(),
  },
  {
    id: "emp_003",
    email: "carol@example.com",
    profileUrl: "https://i.pravatar.cc/150?img=3",
    referralCode: "REF789",
    storeId: "store_02",
    employeeJoinedAt: new Date("2024-07-20T08:45:00Z").toISOString(),
  },
];
