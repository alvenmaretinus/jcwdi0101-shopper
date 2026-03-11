'use client'

import { Pagination } from '@/components/Pagination/Pagination';

interface AdminProductsPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onChange: (page: number) => void;
}

export default function AdminProductsPagination({ page, totalPages, total, onChange }: AdminProductsPaginationProps) {
  return (
    <Pagination
      page={page}
      totalPages={totalPages}
      total={total}
      onChange={onChange}
    />
  );
}