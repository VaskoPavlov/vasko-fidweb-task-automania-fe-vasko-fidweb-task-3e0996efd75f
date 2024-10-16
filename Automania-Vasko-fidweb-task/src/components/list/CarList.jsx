import React, { useContext, useState } from 'react';
import * as styles from './list.module.css';
import { UserContext } from '../../contexts/userContext';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';

export default function CarList(car) {
    const priceFormated = car.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

    const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);


  const handleDeleteCar = async () => {
    const token = localStorage.getItem('token');
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        const response = await fetch(`https://automania.herokuapp.com/listing/${car._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`, 
          },
        });
        const result = await response.json();
        if (result.success) {
            window.location.reload();
            navigate('/listing/list');
        } else {
            alert('Failed to delete the listing.');
        }
      } catch (error) {
        console.error('Error deleting the listing:', error);
      }
    }
  };

    return (
        <div
            className={styles.listingItem}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={styles.carCard}>
                <img src={car.mainPhoto} alt={car.brand} />
                <div className={styles.carInfo}>
                <h3 className={styles.brandModel}>{car.brand} {car.model}</h3>
                <p className={styles.price}>{priceFormated} BGN</p>
                </div>
            </div>
            {user && user._id === car.user._id && isHovered && (
            <div className={styles.manageMenu}>
            <button className={styles.manageButton}>
                <i className="fas fa-cog"></i> Manage
            </button>
            <div className={styles.dropdownMenu}>
            <div className={styles.dropdownTriangle}></div>
                <Link to={`/listing/${car._id}`}>
                    <button className={styles.editButton}>
                        <i className="fas fa-pen"></i> Edit Listing
                    </button>
                </Link>
                <button className={styles.deleteButton} onClick={handleDeleteCar}>
                    <i className="fas fa-trash"></i> Delete Listing
                </button>
            </div>
        </div>
            )}
        </div>
    );
}