import React from "react";
import { Link } from "react-router-dom";

function NFTTile({ data }) {
  const { tokenId, image, name, description, price, owner, seller } = data || {};
  const newTo = { pathname: `/nftPage/${tokenId}` };

  if (!data) {
    console.error("NFTTile: No data provided");
    return null;
  }

  return (
    <Link to={newTo} aria-label={`View details for ${name || "NFT"}`}>
      <div className="relative border-2 border-white/10 ml-12 mt-5 mb-12 flex flex-col items-center rounded-lg w-48 md:w-72 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 ease-in-out overflow-hidden group bg-gradient-to-br from-[#1a1a1a] to-[#2c2c2c] backdrop-blur-sm">
        {/* Neon Glow Effect on Hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-pink-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>

        {/* Image Section */}
        <div className="w-full h-48 md:h-64 overflow-hidden relative">
          <img
            src={image || "/fallback-image.png"}
            alt={name ? `${name} NFT` : "NFT Image - No name provided"}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
            crossOrigin="anonymous"
            onError={(e) => {
              e.target.src = "/fallback-image.png";
            }}
          />
          {/* Glass Morphism Overlay */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        {/* Details Section */}
        <div className="w-full p-4 bg-transparent">
          {/* Name */}
          <strong className="text-xl text-white font-bold block mb-2">
            {name || "Unnamed NFT"}
          </strong>

          {/* Description */}
          <p
            className="text-sm text-gray-300 truncate mb-3"
            title={description || "No description available"}
          >
            {description || "No description available"}
          </p>

          {/* Price */}
          <p className="text-yellow-400 font-semibold text-lg mb-3 glow">
            {price ? `${price} ETH` : "Price Not Listed"}
          </p>

          {/* Owner and Seller Details */}
          <div className="text-xs text-gray-400 space-y-1">
            <p className="flex justify-between">
              <span>Owner:</span>
              <span className="text-right break-all">{owner || "Unknown"}</span>
            </p>
            <p className="flex justify-between">
              <span>Seller:</span>
              <span className="text-right break-all">{seller || "Unknown"}</span>
            </p>
          </div>
        </div>

        {/* Hover Effect - Floating Label */}
        <div className="absolute top-4 right-4 bg-black/70 px-3 py-1 rounded-full text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
          View Details
        </div>

        {/* Futuristic Border Glow */}
        <div className="absolute inset-0 border-2 border-white/10 rounded-lg pointer-events-none group-hover:border-purple-500/50 group-hover:shadow-[0_0_20px_5px_rgba(192,132,252,0.3)] transition-all duration-300"></div>
      </div>
    </Link>
  );
}

export default NFTTile;