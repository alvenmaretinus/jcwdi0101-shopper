export interface YearSelectionItem {
  id: string;
  name: string;
}

export interface YearSelectionParams {
  name?: string;
  page: number;
  limit: number;
}

export interface YearSelectionResponse {
  data: YearSelectionItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const getYearsForSelection = async ({
  name,
  page,
  limit,
}: YearSelectionParams): Promise<YearSelectionResponse> => {
  const currentYear = new Date().getFullYear();
  const epochYear = 1970;
  const allYears = Array.from({ length: currentYear - epochYear + 1 }, (_, i) => currentYear - i).map((year) => ({
    id: String(year),
    name: String(year),
  }));

  const keyword = name?.trim().toLowerCase();
  const filteredYears = keyword
    ? allYears.filter((year) => year.name.toLowerCase().includes(keyword))
    : allYears;

  const total = filteredYears.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const data = filteredYears.slice(start, start + limit);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};
