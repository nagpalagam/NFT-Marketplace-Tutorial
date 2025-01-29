import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { GetIpfsUrlFromPinata } from "../utils";
import Navbar from "./Navbar"; 

export default function NFTPage() {
  const [data, updateData] = useState({});
  const [dataFetched, updateDataFetched] = useState(false);
  const [message, updateMessage] = useState("");
  const [currAddress, updateCurrAddress] = useState("0x");

  const CONTRACT_ADDRESS = "0x6AeD57D577542A04646eA9b1780adB6288768242"; 
  const params = useParams();
  const tokenId = params.tokenId;

  // Async function to fetch NFT data
  async function fetchNFTData(tokenId) {
    try {
      const ethers = require("ethers");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const addr = await signer.getAddress();
  
      let contract = new ethers.Contract(CONTRACT_ADDRESS, MarketplaceJSON.abi, signer);
      let tokenURI = await contract.tokenURI(tokenId);
      console.log("tokenURI:", tokenURI);
  
      // If tokenURI is an IPFS link, ensure it's properly formatted
      if (tokenURI.startsWith("ipfs://")) {
        tokenURI = `https://ipfs.io/ipfs/${tokenURI.slice(7)}`;
      }
  
      if (!tokenURI.startsWith("http://") && !tokenURI.startsWith("https://")) {
        throw new Error("Resolved tokenURI is not a valid URL.");
      }
  
      let meta = await axios.get(tokenURI);
      console.log("Fetched metadata:", meta.data);
  
      const listedToken = await contract.getListedTokenForId(tokenId);
      console.log("listedToken", listedToken);
  
      let item = {
        price: meta.data.price,
        tokenId: tokenId,
        seller: listedToken.seller,
        owner: listedToken.owner,
        name: meta.data.name,
        description: meta.data.description,
      };
  
      // Ensure image URL is correctly processed
      let imageUrl = await GetIpfsUrlFromPinata(meta.data.image);
      console.log("image",meta)
      item.image = imageUrl;
  
      updateData(meta.data);
      updateDataFetched(true);
      updateCurrAddress(addr);
    } catch (error) {
      console.error("Error fetching NFT data:", error);
      updateMessage("Error fetching data");
    }
  }

  // Function to buy NFT
  async function buyNFT(tokenId) {
    try {
      const ethers = require("ethers");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const addr = await signer.getAddress(); // Get current address of the buyer
  
      let contract = new ethers.Contract(CONTRACT_ADDRESS, MarketplaceJSON.abi, signer);
      const salePrice = ethers.utils.parseUnits(data.price, "ether");
  
      // Fetch the current owner of the token
      const tokenOwner = await contract.ownerOf(tokenId);
      
      // Check if the buyer is the current owner or not
      if (addr === tokenOwner) {
        throw new Error("You already own this NFT!");
      }
  
      updateMessage("Buying the NFT... Please Wait (Up to 5 mins)");
  
      // Execute the sale
      let transaction = await contract.executeSale(tokenId, { value: salePrice });
      await transaction.wait();
  
      alert("You successfully bought the NFT!");
      updateMessage("");
    } catch (e) {
      alert("Error: " + e.message || e);
    }
  }
  
  // Fetch data once when the page loads
  useEffect(() => {
    if (tokenId && !dataFetched) {
      fetchNFTData(tokenId);  // Fetch NFT data if tokenId is valid
    }
  }, [dataFetched, tokenId]); // Ensure tokenId is available

  return (
    <div style={{ minHeight: "100vh" }}>
      <Navbar />
      <div className="flex ml-20 mt-20">
        <img
          src={data.image || 'https://via.placeholder.com/150'}
          alt="NFT Image"
          className="w-2/5"
        />
        <div className="text-xl ml-20 space-y-8 text-white shadow-2xl rounded-lg border-2 p-5">
          <div>Name: {data.name}</div>
          <div>Description: {data.description}</div>
          <div>Price: <span>{data.price + " ETH"}</span></div>
          <div>Owner: <span className="text-sm">{data.owner}</span></div>
          <div>Seller: <span className="text-sm">{data.seller}</span></div>
          <div>
            {currAddress !== data.owner && currAddress !== data.seller ? (
              <button
                className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                onClick={() => buyNFT(tokenId)}
              >
                Buy this NFT
              </button>
            ) : (
              <div className="text-emerald-700">You are the owner of this NFT</div>
            )}
            <div className="text-green text-center mt-3">{message}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
