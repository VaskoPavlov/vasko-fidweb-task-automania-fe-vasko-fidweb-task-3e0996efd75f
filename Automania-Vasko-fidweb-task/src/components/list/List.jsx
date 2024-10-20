import React, { useState, useEffect, useRef } from 'react';
import CarList from './CarList';
import * as styles from './list.module.css';
import { useGetAllListings } from '../../hooks/useLists';
import { useWindowWidth } from '../../hooks/useWindowWidth';

export default function List() {
  const isMobile = useWindowWidth();
  const [pageNumber, setPageNumber] = useState(1);
  const [listings, setListings] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [totalFetched, setTotalFetched] = useState(0);
  const containerRef = useRef(null);

  const pageSize = isMobile ? 4 : 15;
  
  const { listings: newListings, loading, error, totalDocs, hasNextPage } = useGetAllListings(pageNumber, pageSize, '', false);
  const cap = totalDocs;

  useEffect(() => {
    if (!loading && newListings.length > 0) {
      const listingsToAdd = newListings.slice(0, Math.min(cap - totalFetched, newListings.length));
      setListings(prevListings => [...prevListings, ...listingsToAdd]);
      setTotalFetched(prevTotal => prevTotal + listingsToAdd.length);
      setIsFetching(false);
    }
  }, [newListings, loading]);

  useEffect(() => {
    setPageNumber(1);
    setListings([]);
    setTotalFetched(0);
  }, [isMobile]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (
      container.scrollTop + container.clientHeight >= container.scrollHeight - 1 &&
      !isFetching &&
      hasNextPage &&
      totalFetched < Math.min(cap, totalDocs)
    ) {
      setIsFetching(true);
      setPageNumber(prevPageNumber => prevPageNumber + 1);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isFetching, hasNextPage, totalFetched, totalDocs]);

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className={styles.carListings}>
      <div className={styles.scrollableContainer} ref={containerRef}>
        <div className={styles.carListingsHeader}>
          <h2 className={styles.carsNumber}>
            CAR LISTINGS ({totalFetched}/{Math.min(cap, totalDocs)})
          </h2>
        </div>
        <div className={styles.carGrid}>
          {listings.map(car => (
            <CarList key={car._id} {...car} />
          ))}
        </div>
        {loading && <p>Loading more listings...</p>}
        {!hasNextPage && !loading && <p>No more listings to show.</p>}
      </div>
    </div>
  );
}
