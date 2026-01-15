"use client";

import { useState, useEffect } from "react";
import { axiosInstance } from "@/lib/axiosInstance";

/**
 * Generic hook to fetch data from an API on initial mount.
 *
 * Usage:
 * const { data, setData, isLoading } = useInitialFetch<Type>(url);
 *
 * Notes:
 * - `data` and `setData` work like normal state, but `data` is initially populated from the url u put in param.
 * - `isLoading` is true while fetching.
 * - If an error occurs, a toast is shown and `data` stays null.
 * - Fetch happens automatically on first render / mount.
 *
 * @typeParam `<T>` - Type of the result you are fetching
 * @param {string} url - The API endpoint to fetch data from
 * @returns {{ data: T | null, setData: React.Dispatch<React.SetStateAction<T | null>>, isLoading: boolean }}
 */

export function useInitialFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await axiosInstance.get<T>(url);
        setData(res.data);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, setData, isLoading };
}
