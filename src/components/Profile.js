
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { GetIpfsUrlFromPinata } from "../utils";
import Navbar from "./Navbar"; 
import './profile.css';

export default function Profile() {
  const [nfts, setNfts] = useState([]); // Store NFT data
  const [walletAddress, setWalletAddress] = useState(""); // Store wallet address
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const CONTRACT_ADDRESS = "0x6AeD57D577542A04646eA9b1780adB6288768242"; // Marketplace contract address

  // Fetch NFTs from the wallet address
  const fetchNFTsFromWallet = async () => {
    setLoading(true);
    setErrorMessage(""); // Clear any previous errors
  
    try {
      const ethers = require("ethers");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress(); // Get current connected wallet address
      setWalletAddress(address);
  
      let contract = new ethers.Contract(CONTRACT_ADDRESS, MarketplaceJSON.abi, signer);
  
      // Fetch the NFTs owned by the wallet using getMyNFTs
      const nfts = await contract.getMyNFTs();
      const nftsArray = [];
  
      for (let i = 0; i < nfts.length; i++) {
        const nft = nfts[i];
  
        // Fetch tokenURI for the NFT
        let tokenURI;
        try {
          tokenURI = await contract.tokenURI(nft.tokenId);
          console.log("Original tokenURI:", tokenURI);
  
          // If tokenURI is an IPFS link, ensure it's properly formatted
          if (tokenURI.startsWith("ipfs://")) {
            tokenURI = `https://ipfs.io/ipfs/${tokenURI.slice(7)}`;
          }
  
          // Check if the tokenURI is a valid URL
          if (!tokenURI.startsWith("http://") && !tokenURI.startsWith("https://")) {
            throw new Error("Resolved tokenURI is not a valid URL.");
          }
  
          // Fetch metadata from the resolved token URI
          const meta = await axios.get(tokenURI);
          console.log("Fetched metadata:", meta.data);
  
          // Fetch the listed token details from the contract
          const listedToken = await contract.getListedTokenForId(nft.tokenId);
          console.log("Listed token:", listedToken);
  
          // Convert BigNumber price to a string or number before rendering
          const price = ethers.utils.formatEther(listedToken.price); // Convert from wei to ether
  
          // Push the resolved NFT data into the array
          nftsArray.push({
            tokenId: nft.tokenId,
            name: meta.data.name,
            description: meta.data.description,
            image: meta.data.image, // Assuming the image is hosted in the metadata
            price: price, // Renderable price as a string
          });
        } catch (error) {
          console.error("Error fetching tokenURI or metadata for NFT:", error);
          // Optionally add a fallback or continue to next NFT
          continue; // Skip this NFT and continue with the rest
        }
      }
  
      // Once all promises are resolved, update the state
      setNfts(nftsArray); // Update the state with fetched NFTs
    } catch (error) {
      console.error("Error fetching NFTs from wallet:", error);
      setErrorMessage("There was an issue fetching NFTs.");
    }
  
    // Stop loading after all promises are resolved
    setLoading(false);
  };
  
  

  // Trigger fetch on component mount
  useEffect(() => {
    fetchNFTsFromWallet(); // Fetch NFTs when component mounts
  }, []);

  return (
    <div>
      <Navbar />
      <div className="profileClass">
        <div className="text-center">
          <h2 className="font-bold text-xl">Wallet Address</h2>
          <p>{walletAddress}</p>
        </div>
  
        {loading && <p>Loading your NFTs...</p>}
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
  
        {/* Added Current Price Section */}
        <div className="text-center">
          <h2 className="font-bold text-xl">NFT Profile</h2>
          <p>Current Price: <span className="text-yellow-500">1 ETH = $3,000</span></p>
        </div>
  
        <div className="nfts-list">
          {nfts.length === 0 && !loading && <p>No NFTs found for this wallet.</p>}
          
          {nfts.map((nft, index) => (
            <div key={index} className="nft-tile">
              <img src={nft.image || "/fallback-image.png"} alt={nft.name} />
              <h3>{nft.name}</h3>
              <p>{nft.description}</p>
              <p className="text-yellow-500">{nft.price} ETH</p> {/* Optional: Style NFT price in yellow */}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}