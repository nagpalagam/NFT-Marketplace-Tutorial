import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { GetIpfsUrlFromPinata } from "../utils";
import Navbar from "./Navbar"; 
import './profile.css';

export default function Profile() {
  const [nfts, setNfts] = useState([]);
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [totalValue, setTotalValue] = useState(0); // Added total value state

  const CONTRACT_ADDRESS = "0x6AeD57D577542A04646eA9b1780adB6288768242";

  // Calculate total value when NFTs change
  useEffect(() => {
    const calculateTotalValue = () => {
      const ethPrice = 3000; // USD per ETH
      const totalETH = nfts.reduce((acc, nft) => {
        const price = parseFloat(nft.price) || 0;
        return acc + price;
      }, 0);
      setTotalValue((totalETH * ethPrice).toFixed(2));
    };
    calculateTotalValue();
  }, [nfts]);

  const fetchNFTsFromWallet = async () => {
    setLoading(true);
    setErrorMessage("");
  
    try {
      const ethers = require("ethers");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);

      let contract = new ethers.Contract(CONTRACT_ADDRESS, MarketplaceJSON.abi, signer);
      const nfts = await contract.getMyNFTs();
      const nftsArray = [];

      for (let i = 0; i < nfts.length; i++) {
        const nft = nfts[i];
        try {
          let tokenURI = await contract.tokenURI(nft.tokenId);
          
          if (tokenURI.startsWith("ipfs://")) {
            tokenURI = `https://ipfs.io/ipfs/${tokenURI.slice(7)}`;
          }

          const meta = await axios.get(tokenURI);
          const listedToken = await contract.getListedTokenForId(nft.tokenId);
          const price = ethers.utils.formatEther(listedToken.price);

          nftsArray.push({
            tokenId: nft.tokenId,
            name: meta.data.name,
            description: meta.data.description,
            image: meta.data.image,
            price: price,
          });
        } catch (error) {
          console.error("Error fetching NFT data:", error);
          continue;
        }
      }

      setNfts(nftsArray);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      setErrorMessage("There was an issue fetching NFTs.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNFTsFromWallet();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="profileClass">
        <div className="text-center">
          <h2 className="font-bold text-xl">Wallet Address</h2>
          <p className="break-words">{walletAddress}</p>
        </div>

        {loading && <p className="text-center">Loading your NFTs...</p>}
        {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}
        
        {/* Total Value Display */}
        <div className="text-center my-4 p-4 bg-gray-100 rounded-lg border-2 border-yellow-200">
          <h2 className="font-bold text-xl mb-2">Total NFT Value</h2>
          <p className="text-lg">
            <span className="text-yellow-500 font-semibold">
              ${totalValue} USD
            </span>
            <span className="block text-sm text-yellow-600 mt-1">
              ({(totalValue / 3000).toFixed(2)} ETH)
            </span>
          </p>
        </div>

        <div className="text-center mb-4">
          <h2 className="font-bold text-xl">NFT Profile</h2>
          <p>Current Price: <span className="text-yellow-500">1 ETH = $3,000</span></p>
        </div>

        <div className="nfts-list">
          {nfts.length === 0 && !loading && (
            <p className="text-center">No NFTs found for this wallet.</p>
          )}
          
          {nfts.map((nft, index) => (
            <div key={index} className="nft-tile">
              <img 
                src={nft.image || "/fallback-image.png"} 
                alt={nft.name} 
                className="h-48 w-full object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold">{nft.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{nft.description}</p>
                <p className="text-yellow-600 font-medium">{nft.price} ETH</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}