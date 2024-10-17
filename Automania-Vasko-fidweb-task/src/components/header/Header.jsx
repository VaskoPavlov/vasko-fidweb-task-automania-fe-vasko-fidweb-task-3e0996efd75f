import { useContext } from "react";
import * as styles from './header.module.css';
import { UserContext } from "../../contexts/userContext";
import { Link, useNavigate } from "react-router-dom";  

export default function Header() {
    const { user } = useContext(UserContext);  
    const navigate = useNavigate();  

    const handleAddListingClick = () => {
        if (user) {
            navigate('/listing/create');  
        } else {
            navigate('/user/login'); 
        }
    };

    return (
        <header className={styles.header}>
            <div className={styles.logoDiv}>
                <Link to="/listing/list">
                    <img className={styles.logo} src={`../public/imagesAndSvgs/Group19448.svg`} alt="Automania logo" />
                </Link>
            </div>
            <div className={styles.buttons}>
                <img className={styles.profile} src={`../public/imagesAndSvgs/profile.svg`} alt="Log in" />
                {user ? (
                    <p className={styles.user}>Hi, {user.fullName}</p> 
                ) : (
                    <Link to="/user/login">
                        <div className={styles.logIn}>Log in</div>
                    </Link>
                )}
                <span className={styles.span}></span>
                <div className={styles.verticalLine}></div>
                <div className={styles.addButton}>
                    <button className={styles.addListingButton} onClick={handleAddListingClick}>
                        <img className={styles.addSvg} src='../public/Group 19449/Group 19449.png'></img>
                        <span className={styles.addText}> Add Listing</span>
                    </button>
                </div>
            </div>
            <div className={styles.mobileButtons}>
                <div className={user ? styles.personLoggedIn : styles.personLoggedOut}>
                    <img className={styles.mobileProfileIcon} src={`../public/imagesAndSvgs/profile.svg`} alt="Profile" />
                </div>

                {/* <Link to="/user/login">
                </Link> */}
                <button className={styles.mobileAddButton} onClick={() => navigate(user ? '/listing/create' : '/user/login')}>
                    <img className={styles.mobileAddIcon} src='../public/Group 19449/Group 19449.png' alt="Add Listing" />
                </button>
            </div>
        </header>
    );
}
