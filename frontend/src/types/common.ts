export type SelectableItem = {
  id: string;
  name: string;
};

export type PaginationState = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
