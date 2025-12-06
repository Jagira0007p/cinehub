import { useEffect, useRef } from "react";

const NativeAd = () => {
  const adRef = useRef(null);

  useEffect(() => {
    // Prevent double-loading the script
    if (adRef.current && !adRef.current.querySelector("script")) {
      const script = document.createElement("script");
      script.async = true;
      script.dataset.cfasync = "false";
      // Your specific ad script URL
      script.src =
        "//pl28199034.effectivegatecpm.com/f0100bf7a64a508b8d101bc3da4cee80/invoke.js";

      adRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className="my-8 w-full flex justify-center">
      {/* This ID allows the ad script to find where to place the ads */}
      <div
        id="container-f0100bf7a64a508b8d101bc3da4cee80"
        ref={adRef}
        className="w-full"
      />
    </div>
  );
};

export default NativeAd;
