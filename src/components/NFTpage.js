import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { GetIpfsUrlFromPinata } from "../utils";
import Navbar from "./Navbar";
import { ethers } from "ethers";

export default function NFTPage() {
  const [nftData, setNftData] = useState({
    image: "",
    name: "",
    description: "",
    price: "",
    owner: "",
    seller: ""
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [currentAddress, setCurrentAddress] = useState("");
  
  const { tokenId } = useParams();
  const CONTRACT_ADDRESS = "0x6AeD57D577542A04646eA9b1780adB6288768242";

  useEffect(() => {
    async function initialize() {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        setCurrentAddress(await signer.getAddress());
        fetchNFTData();
      }
    }
    initialize();
  }, []);

  async function fetchNFTData() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        MarketplaceJSON.abi,
        provider
      );

      const [tokenURI, listedToken] = await Promise.all([
        contract.tokenURI(tokenId),
        contract.getListedTokenForId(tokenId)
      ]);

      // Process metadata
      const metaResponse = await axios.get(
        tokenURI.startsWith("ipfs://") 
          ? `https://ipfs.io/ipfs/${tokenURI.split("ipfs://")[1]}`
          : tokenURI
      );

      // Process image URL
      const imageUrl = metaResponse.data.image.startsWith("ipfs://")
        ? `https://ipfs.io/ipfs/${metaResponse.data.image.split("ipfs://")[1]}`
        : metaResponse.data.image;

      setNftData({
        ...metaResponse.data,
        image: imageUrl,
        price: ethers.utils.formatUnits(listedToken.price, "ether"),
        owner: listedToken.owner,
        seller: listedToken.seller
      });

      setLoading(false);
    } catch (error) {
      console.error("NFT Data Error:", error);
      setMessage("Failed to load NFT data");
      setLoading(false);
    }
  }

  async function buyNFT() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        MarketplaceJSON.abi,
        signer
      );

      setMessage("Processing transaction...");
      const tx = await contract.executeSale(tokenId, {
        value: ethers.utils.parseUnits(nftData.price, "ether")
      });
      
      await tx.wait();
      setMessage("Purchase successful! Updating details...");
      await fetchNFTData(); // Refresh data after purchase
      setMessage("");
      
    } catch (error) {
      console.error("Purchase Error:", error);
      setMessage(error.message || "Transaction failed");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-2xl text-blue-400 animate-pulse">
          Loading NFT Details...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Preview */}
          <div className="relative group rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={nftData.image}
              alt="NFT Artwork"
              className="w-full h-96 object-contain bg-gray-800"
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = "placeholder-image-url";
              }}
            />
          </div>

          {/* Details Card */}
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-700">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-6">
              {nftData.name}
            </h1>

            <div className="space-y-6">
              <p className="text-gray-300 text-lg leading-relaxed">
                {nftData.description}
              </p>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-900/50 rounded-xl">
                  <span className="text-gray-400">Price</span>
                  <span className="text-2xl font-bold text-blue-400">
                    {nftData.price} ETH
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-900/50 rounded-xl">
                    <div className="text-sm text-gray-400 mb-1">Owner</div>
                    <div className="text-yellow-400 font-mono truncate">
                      {nftData.owner}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-900/50 rounded-xl">
                    <div className="text-sm text-gray-400 mb-1">Seller</div>
                    <div className="text-yellow-400 font-mono truncate">
                      {nftData.seller}
                    </div>
                  </div>
                </div>
              </div>

              {currentAddress && (
                <div className="pt-4">
                  {currentAddress !== nftData.owner && currentAddress !== nftData.seller ? (
                    <button
                      onClick={buyNFT}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 hover:shadow-xl disabled:opacity-50"
                      disabled={!!message}
                    >
                      {message ? message : "Buy Now"}
                    </button>
                  ) : (
                    <div className="text-center p-4 bg-emerald-900/30 rounded-xl border border-emerald-400/20 text-emerald-400">
                      {currentAddress === nftData.owner 
                        ? "You own this NFT"
                        : "You listed this NFT"}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}