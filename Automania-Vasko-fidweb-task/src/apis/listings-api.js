import * as request from './requester';

const BASE_URL = `https://automania.herokuapp.com/`;

const getAll = async () => {
    const data = {
        "pageNumber": 1,        
        "pageSize": 10,         
        "sortBy": "",           
        "noPagination": false
    }
    const result = await request.post(`${BASE_URL}/listing/list`, data);
    return result.json()
}
export {
    getAll,
}

export const createListing = async (listingData, token) => {
  try {
    const response = await fetch(`${BASE_URL}/listing/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(listingData),
    });

    if (!response.ok) {
      throw new Error('Failed to create listing');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};
