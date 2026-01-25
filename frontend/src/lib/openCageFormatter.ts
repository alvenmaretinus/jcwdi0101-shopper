"use server";

export const openCageFormatter = async (postCode: string) => {
  const res = await fetch(
    `https://api-sandbox.collaborator.komerce.id/tariff/api/v1/destination/search?keyword=${postCode}`,
    {
      method: "GET",
      headers: {
        "x-api-key": process.env.KOMERCE_API_KEY!,
      },
    }
  );
  const data = await res.json();
  return data.data[0] as {
    zip_code: string;
    label: string;
  };
};
