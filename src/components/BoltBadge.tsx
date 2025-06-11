import React from 'react';

export function BoltBadge() {
  return (
    <a
      href="https://bolt.new/"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed top-4 right-4 z-50 transition-all duration-300 hover:scale-110 hover:shadow-xl"
      aria-label="Powered by Bolt.new"
    >
      <div className="bg-white rounded-full p-2 shadow-lg hover:shadow-2xl border-2 border-gray-200 hover:border-gray-300">
        <img
          src="/white_circle_360x360.png"
          alt="Powered by Bolt.new"
          className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain"
        />
      </div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-black text-white text-xs rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
        Powered by Bolt.new
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
      </div>
    </a>
  );
}