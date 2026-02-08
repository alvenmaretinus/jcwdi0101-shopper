import { prisma } from "../../src/lib/db/prisma";

// Jakarta area coordinates (approximate)
const jakartaLocations = [
  {
    name: "Store Jakarta Pusat",
    lat: -6.1865,
    lng: 106.8341,
    address: "Jl. Medan Merdeka No.1, Jakarta Pusat",
    postCode: "10110",
  },
  {
    name: "Store Jakarta Utara",
    lat: -6.1383,
    lng: 106.8639,
    address: "Jl. Yos Sudarso No.10, Jakarta Utara",
    postCode: "14320",
  },
  {
    name: "Store Jakarta Barat",
    lat: -6.1683,
    lng: 106.7588,
    address: "Jl. Daan Mogot No.25, Jakarta Barat",
    postCode: "11510",
  },
  {
    name: "Store Jakarta Selatan",
    lat: -6.2615,
    lng: 106.8106,
    address: "Jl. Sudirman No.50, Jakarta Selatan",
    postCode: "12190",
  },
  {
    name: "Store Jakarta Timur",
    lat: -6.2251,
    lng: 106.9004,
    address: "Jl. Bekasi Timur No.15, Jakarta Timur",
    postCode: "13310",
  },
  {
    name: "Store Tangerang",
    lat: -6.1783,
    lng: 106.6319,
    address: "Jl. Sudirman No.100, Tangerang",
    postCode: "15111",
  },
  {
    name: "Store Bekasi",
    lat: -6.2349,
    lng: 106.9896,
    address: "Jl. Ahmad Yani No.88, Bekasi",
    postCode: "17141",
  },
  {
    name: "Store Depok",
    lat: -6.4025,
    lng: 106.7942,
    address: "Jl. Margonda Raya No.200, Depok",
    postCode: "16431",
  },
  {
    name: "Store Bogor",
    lat: -6.5944,
    lng: 106.7892,
    address: "Jl. Pajajaran No.45, Bogor",
    postCode: "16143",
  },
  {
    name: "Store Bandung",
    lat: -6.9175,
    lng: 107.6191,
    address: "Jl. Asia Afrika No.100, Bandung",
    postCode: "40111",
  },
];

// Generate 30 stores
const generateStores = () => {
  const stores = [];

  for (let i = 0; i < 30; i++) {
    const location = jakartaLocations[i % jakartaLocations.length];
    const storeNumber = i + 1;

    stores.push({
      name: `${location.name} ${i >= 10 ? `#${Math.floor(i / 10) + 1}` : ""}`,
      description: `Store location ${storeNumber} - Serving customers in the ${location.name.replace("Store ", "")} area`,
      phone: `021-${String(1000000 + i).slice(1)}`,
      latitude: location.lat + (Math.random() - 0.5) * 0.01, // Slight variation
      longitude: location.lng + (Math.random() - 0.5) * 0.01,
      addressName: `${location.address} ${storeNumber > 10 ? "Blok " + String.fromCharCode(65 + (i % 26)) : ""}`,
      postCode: location.postCode,
      isDefault: i === 0,
    });
  }

  return stores;
};

export async function seedStores() {
  console.log("Seeding stores...");

  // Find super admin
  const superAdmin = await prisma.user.findFirst({
    where: { email: "superadmin@example.com" },
  });

  if (!superAdmin) {
    console.error("Super admin not found. Please run seedAccounts first.");
    return;
  }

  const stores = generateStores();

  for (const storeData of stores) {
    const store = await prisma.store.create({
      data: {
        id: crypto.randomUUID(),
        ...storeData,
        isSoftDeleted: false,
      },
    });

    console.log(`Created store: ${store.name} with super admin as owner`);
  }

  console.log(`Store seeding completed. Created ${stores.length} stores.`);
}
