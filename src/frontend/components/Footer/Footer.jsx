import { Link } from 'react-router-dom';
import { FOOTER_LINKS } from '../../constants/constants';
import styles from './Footer.module.css';

const Footer = () => {
  const presentYear = new Date().getFullYear();

  return (
    <section className={styles.footer}>
      <div className={styles.linksContainer}>
        {FOOTER_LINKS.map((singleLink) => (
          <Link key={singleLink.id} to={singleLink.url} target='_blank'>
            {singleLink.icon}
          </Link>
        ))}
      </div>

      <div className={styles.copyrightDiv}>
        <span>© {presentYear} </span>
        <div className={styles.jethaDiv}>
          <button className={styles.nameBtn}>
            Yero Shop!.
          </button>
        </div>
        <span>All rights reserved</span>
      </div>
    </section>
  );
};

export default Footer;
