import { useEffect, useRef } from "react";

const AdBanner = () => {
  const bannerRef = useRef(null);

  useEffect(() => {
    if (bannerRef.current && !bannerRef.current.firstChild) {
      // 2. PASTE YOUR BANNER SCRIPT CONFIGURATION HERE
      // Note: Adsterra usually gives a div + script.
      // Put the script creation logic here.

      const conf = document.createElement("script");
      conf.type = "text/javascript";
      conf.src = "//www.highperformanceformat.com/YOUR_BANNER_ID/invoke.js"; // Replace this URL

      // Adsterra specific settings (Example)
      const settings = document.createElement("script");
      settings.type = "text/javascript";
      settings.innerHTML = `
        atOptions = {
          'key' : 'YOUR_KEY_HERE',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
      `;

      bannerRef.current.appendChild(settings);
      bannerRef.current.appendChild(conf);
    }
  }, []);

  return (
    <div className="flex justify-center my-6 overflow-hidden rounded-lg shadow-lg border border-gray-800 bg-black/50">
      <div ref={bannerRef} />
    </div>
  );
};

export default AdBanner;
