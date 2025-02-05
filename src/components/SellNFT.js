import Navbar from "./Navbar";
import { useState } from "react";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../pinata";
import MarketplaceABI from "../Marketplace.json"; // Import ABI from the JSON
import { useLocation } from "react-router";
import { ethers } from "ethers"; // Import ethers for easy contract interaction

export default function SellNFT() {
  const [formParams, updateFormParams] = useState({ name: "", description: "", price: "" });
  const [fileURL, setFileURL] = useState(null);
  const [message, updateMessage] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(false); // State for button disabled
  const location = useLocation();

  // Handle file upload
  async function OnChangeFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsButtonDisabled(true); // Disable button
      updateMessage("Uploading image.. please don't click anything!");
      const response = await uploadFileToIPFS(file);
      if (response.success === true) {
        setIsButtonDisabled(false); // Enable button
        updateMessage("");
        setFileURL(response.pinataURL);
      } else {
        setIsButtonDisabled(false); // Enable button
        updateMessage("Failed to upload image: " + response.message);
      }
    } catch (e) {
      setIsButtonDisabled(false); // Enable button
      updateMessage("Error during file upload: " + e.message);
    }
  }

  // Upload metadata to IPFS
  async function uploadMetadataToIPFS() {
    const { name, description, price } = formParams;
    if (!name || !description || !price || !fileURL) {
      updateMessage("Please fill all the fields!");
      return -1;
    }

    const nftJSON = { name, description, price, image: fileURL };

    try {
      const response = await uploadJSONToIPFS(nftJSON);
      if (response.success === true) {
        return response.pinataURL;
      } else {
        updateMessage("Failed to upload metadata: " + response.message);
      }
    } catch (e) {
      updateMessage("Error uploading JSON metadata: " + e.message);
    }
  }

  // Handle listing the NFT
  async function listNFT(e) {
    e.preventDefault();

    try {
      const metadataURL = await uploadMetadataToIPFS();
      if (metadataURL === -1) return;

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.listAccounts();
      if (accounts.length === 0) {
        alert("Please connect to MetaMask.");
        return;
      }

      const signer = provider.getSigner();
      setIsButtonDisabled(true); // Disable button
      updateMessage("Uploading NFT (takes 5 mins).. please don't click anything!");

      // Hardcode the contract address
      const contractAddress = "0x6AeD57D577542A04646eA9b1780adB6288768242";

      // Create contract instance
      const contract = new ethers.Contract(contractAddress, MarketplaceABI.abi, signer);

      const price = ethers.utils.parseUnits(formParams.price, "ether");

      // Log values for debugging
      console.log("Metadata URL:", metadataURL);
      console.log("Price to list (in ETH):", ethers.utils.formatEther(price));

      let listingPrice = await contract.getListPrice();
      listingPrice = listingPrice.toString();
      console.log("Listing Price (in ETH):", ethers.utils.formatEther(listingPrice));

      const transaction = await contract.createToken(metadataURL, price, { value: listingPrice });
      await transaction.wait();

      alert("Successfully listed your NFT! Please check your wallet for the transaction.");
      setIsButtonDisabled(false); // Enable button
      updateMessage("NFT listing successful!");
      updateFormParams({ name: "", description: "", price: "" });
      window.location.replace("/");
    } catch (e) {
      console.error("Error during listing NFT:", e);
      const errorMessage = e?.data?.message || e?.message || "An unknown error occurred";
      alert("Upload error: " + errorMessage);
      updateMessage("Upload error: " + errorMessage);
      setIsButtonDisabled(false); // Enable button
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-space-900 to-galaxy-900">
        <Navbar />
        
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="glass-container relative p-8 rounded-3xl border border-stellar-border/30 backdrop-blur-xl">
                {/* Floating particles background */}
                <div className="absolute inset-0 bg-particle-pattern opacity-20 animate-float-particles pointer-events-none" />
                
                <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-8 text-center animate-text-glow">
                    ✨ Mint New NFT
                </h3>

                <form className="space-y-8 relative z-10">
                    {/* NFT Name Field */}
                    <div className="cosmic-input-group">
                        <label className="text-cyan-300 text-sm font-semibold mb-2 block">
                            NFT Name
                        </label>
                        <input
                            className="w-full bg-galaxy-100/80 border border-stellar-border/40 rounded-xl py-3 px-4 text-gray-900 placeholder-stellar-gray/50 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                            type="text"
                            placeholder="Quantum Axie #001"
                            onChange={(e) => updateFormParams({ ...formParams, name: e.target.value })}
                            value={formParams.name}
                        />
                    </div>

                    {/* Description Field */}
                    <div className="cosmic-input-group">
                        <label className="text-cyan-300 text-sm font-semibold mb-2 block">
                            NFT Description
                        </label>
                        <textarea
                            className="w-full bg-galaxy-100/80 border border-stellar-border/40 rounded-xl py-3 px-4 text-gray-900 placeholder-stellar-gray/50 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 h-32 resize-none transition-all"
                            placeholder="Describe your digital masterpiece..."
                            value={formParams.description}
                            onChange={(e) => updateFormParams({ ...formParams, description: e.target.value })}
                        />
                    </div>

                    {/* Price Field */}
                    <div className="cosmic-input-group">
                        <label className="text-cyan-300 text-sm font-semibold mb-2 block">
                            Price (ETH)
                        </label>
                        <div className="relative">
                            <input
                                className="w-full bg-galaxy-100/80 border border-stellar-border/40 rounded-xl py-3 px-4 text-gray-900 placeholder-stellar-gray/50 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 pr-16 transition-all"
                                type="number"
                                step="0.01"
                                placeholder="0.01"
                                value={formParams.price}
                                onChange={(e) => updateFormParams({ ...formParams, price: e.target.value })}
                            />
                            <span className="absolute right-4 top-3 text-stellar-gray/50">ETH</span>
                        </div>
                    </div>

                    {/* File Upload */}
                    <div className="cosmic-input-group">
                        <label className="text-cyan-300 text-sm font-semibold mb-2 block">
                            NFT Artwork
                        </label>
                        <div className="relative group">
                            <div className="h-32 flex items-center justify-center border-2 border-dashed border-stellar-border/40 rounded-xl bg-galaxy-100/30 hover:border-cyan-400/60 transition-all cursor-pointer">
                                <input 
                                    type="file" 
                                    onChange={OnChangeFile} 
                                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" 
                                />
                                <div className="text-center space-y-2">
                                    <div className="text-2xl">📤</div>
                                    <p className="text-stellar-gray/60 group-hover:text-cyan- 400/80 transition-colors">
                                        Drag & drop or click to upload
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status Message */}
                    {message && (
                        <div className="text-center py-3 px-4 bg-red-900/20 border border-red-400/30 rounded-xl text-red-400 animate-pulse">
                            {message}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        onClick={listNFT}
                        id="list-button" // Added ID for the button
                        className={`w-full py-4 px-6 ${isButtonDisabled ? 'bg-gray-500 opacity-50' : 'bg-gradient-to-r from-cyan-500/80 to-purple-500/80 hover:from-cyan-400 hover:to-purple-400'} text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] shadow-cyber-glow hover:shadow-cyber-glow-lg`}
                        type="button"
                        disabled={isButtonDisabled} // Disable button based on state
                    >
                        🚀 Mint NFT
                    </button>
                </form>
            </div>
        </div>
    </div>
);
}