import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Analytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Inject Google Analytics (GA4) script if ID is provided
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (gaId && !document.getElementById('ga-script')) {
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      script1.id = 'ga-script';
      document.head.appendChild(script1);

      const script2 = document.createElement('script');
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaId}');
      `;
      document.head.appendChild(script2);
    }

    // Inject Meta Pixel script if ID is provided
    const pixelId = import.meta.env.VITE_META_PIXEL_ID;
    if (pixelId && !document.getElementById('meta-pixel-script')) {
      const script3 = document.createElement('script');
      script3.id = 'meta-pixel-script';
      script3.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixelId}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(script3);
      
      const noscript = document.createElement('noscript');
      noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1" />`;
      document.head.appendChild(noscript);
    }
  }, []);

  // Track page views on route change
  useEffect(() => {
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (gaId && window.gtag) {
      window.gtag('config', gaId, {
        page_path: location.pathname + location.search
      });
    }

    const pixelId = import.meta.env.VITE_META_PIXEL_ID;
    if (pixelId && window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [location]);

  return null;
};

export default Analytics;
