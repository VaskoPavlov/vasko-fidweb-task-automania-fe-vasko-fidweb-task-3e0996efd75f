import { useState, useEffect } from "react";
import { createListing, getAll } from "../apis/listings-api";

export function useGetAllListings(pageNumber = 1, pageSize = 10, sortBy = '', noPagination = false) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalDocs, setTotalDocs] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://automania.herokuapp.com/listing/list', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pageNumber,
            pageSize,
            sortBy,
            noPagination,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch listings');
        }

        const result = await response.json();
        setListings(result.payload.docs || []);
        setTotalDocs(result.payload.totalDocs || 0);
        setHasNextPage(result.payload.hasNextPage);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchListings();
  }, [pageNumber, pageSize, sortBy, noPagination]);

  return { listings, loading, error, totalDocs, hasNextPage };
}



export const useCreateListing = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const submitListing = async (formData, token) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('https://automania.herokuapp.com/listing/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(true);
      } else {
        throw new Error('Failed to create listing');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { submitListing, loading, error, success };
};

export const uploadImages = async (formData) => {
  const token = localStorage.getItem('token');

  try {
    const response = await fetch('https://automania.herokuapp.com/file/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (data.success) {
      return data;
    } else {
      throw new Error('Upload failed');
    }
  } catch (err) {
    console.error(err);
    return { success: false };
  }
};

