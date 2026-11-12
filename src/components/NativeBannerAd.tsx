import React, { useEffect, useRef } from 'react';

interface NativeBannerAdProps {
  className?: string;
}

export const NativeBannerAd: React.FC<NativeBannerAdProps> = ({ className = '' }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const containerId = 'container-49789bd355a16602e7b5056e8a71d76e';
    const adContainer = wrapper.querySelector(`#${containerId}`);
    if (adContainer) {
      adContainer.innerHTML = '';
    }

    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = 'https://bauval.org/21/49789bd355a16602e7b5056e8a71d76e';
    wrapper.appendChild(script);

    return () => {
      if (script.parentNode === wrapper) {
        wrapper.removeChild(script);
      }
      if (adContainer) {
        adContainer.innerHTML = '';
      }
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={`w-full rounded-2xl bg-slate-900/60 border border-slate-800/80 p-3 flex flex-col items-center justify-center overflow-hidden ${className}`}
    >
      <div id="container-49789bd355a16602e7b5056e8a71d76e" className="w-full flex justify-center" />
    </div>
  );
};
