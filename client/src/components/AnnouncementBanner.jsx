import { useState, useEffect } from 'react';
import api from '../utils/api';

const AnnouncementBanner = () => {
  const [text, setText] = useState('');
  const [active, setActive] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data && res.data.settings) {
          if (res.data.settings.announcement_active === 'true') {
            setActive(true);
            setText(res.data.settings.announcement_text || "Free Shipping on All Orders");
          }
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      }
    };
    fetchSettings();
  }, []);

  if (!active) return null;

  return (
    <div style={{
      background: 'var(--color-primary, #d35400)', 
      color: 'white', 
      padding: '8px 0', 
      textAlign: 'center', 
      fontWeight: 'bold', 
      fontSize: '0.9rem',
      width: '100%',
      zIndex: 1000
    }}>
      <marquee scrollamount="5">{text}</marquee>
    </div>
  );
};

export default AnnouncementBanner;
