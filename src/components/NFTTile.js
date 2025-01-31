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
      <div className="border-2 ml-12 mt-5 mb-12 flex flex-col items-center rounded-lg w-48 md:w-72 shadow-2xl hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out">
        <img
          src={image || "/fallback-image.png"}
          alt={name ? `${name} NFT` : "NFT Image - No name provided"}
          className="w-72 h-80 rounded-lg object-cover"
          crossOrigin="anonymous"
          onError={(e) => {
            e.target.src = "/fallback-image.png";
          }}
        />
        <div className="text-white w-full p-2 bg-gradient-to-t from-[#454545] to-transparent rounded-lg pt-5 -mt-20">
          <strong className="text-xl">{name || "Unnamed NFT"}</strong>
          <p className="display-inline" title={description || "No description available"}>
            {description || "No description available"}
          </p>
          <p className="text-yellow-400">{price || "Price Not Listed"}</p>
          <div className="relative w-full mt-2 text-xs text-gray-300 px-2">
  <div className="border-t border-gray-500 pt-2">
    <p className="flex justify-between">
      <strong>Owner:</strong> <span className="break-all text-right">{owner || "Unknown"}</span>
    </p>
    <p className="flex justify-between">
      <strong>Seller:</strong> <span className="break-all text-right">{seller || "Unknown"}</span>
    </p>
  </div>
</div>
        </div>
      </div>
    </Link>
  );
}

export default NFTTile;