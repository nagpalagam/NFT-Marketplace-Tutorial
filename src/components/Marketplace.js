import { useState, useEffect, useMemo, useCallback } from "react";
import { ethers } from "ethers";
import Navbar from "./Navbar";
import NFTTile from "./NFTTile";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";

export default function Marketplace() {
    const [data, updateData] = useState([]);
    const [loading, setLoading] = useState(true);
    const contractAddress = "0x6AeD57D577542A04646eA9b1780adB6288768242";

    // Ethers setup
    const provider = useMemo(() => (
        window.ethereum ? new ethers.providers.Web3Provider(window.ethereum) : null
    ), []);

    const contract = useMemo(() => (
        provider ? new ethers.Contract(contractAddress, MarketplaceJSON.abi, provider) : null
    ), [provider]);

    const getAllNFTs = useCallback(async () => {
        try {
            const signer = provider.getSigner();
            const contractWithSigner = contract.connect(signer);
            const transaction = await contractWithSigner.getAllNFTs();

            const items = await Promise.all(transaction.map(async (i) => {
                let tokenId;
                try {
                    tokenId = i.tokenId.toNumber();
                    let tokenURI = await contractWithSigner.tokenURI(tokenId);

                    // Validate and convert IPFS URL
                    if (!tokenURI || tokenURI.startsWith("0x")) {
                        console.error(`Invalid tokenURI for token ${tokenId}`);
                        return null;
                    }
                    
                    if (tokenURI.startsWith("ipfs://")) {
                        const ipfsHash = tokenURI.split("ipfs://")[1];
                        tokenURI = `https://ipfs.io/ipfs/${ipfsHash}`;
                    }

                    // Fetch metadata with error handling
                    const meta = await axios.get(tokenURI, {
                        timeout: 15000,
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        }
                    }).catch(error => {
                        console.error(`Fetch failed for token ${tokenId}:`, error.message);
                        return null;
                    });

                    if (!meta?.data) {
                        console.error(`Empty metadata for token ${tokenId}`);
                        return null;
                    }

                    // Process image URL
                    let imageUrl = meta.data.image;
                    if (imageUrl?.startsWith("ipfs://")) {
                        const imageHash = imageUrl.split("ipfs://")[1];
                        imageUrl = `https://ipfs.io/ipfs/${imageHash}`;
                    }

                    // Validate required fields
                    if (!imageUrl || !meta.data.name) {
                        console.error(`Missing metadata for token ${tokenId}`);
                        return null;
                    }

                    return {
                        price: ethers.utils.formatUnits(i.price.toString(), "ether"),
                        tokenId,
                        seller: i.seller,
                        owner: i.owner,
                        image: imageUrl,
                        name: meta.data.name,
                        description: meta.data.description || "No description available",
                    };
                } catch (err) {
                    console.error(`Error processing token ${tokenId || 'unknown'}:`, err);
                    return null;
                }
            }));

            updateData(items.filter(item => item !== null));
        } catch (err) {
            console.error("Error fetching NFTs:", err);
            if (err.code === "NETWORK_ERROR") {
                alert("Network error - check your internet connection");
            }
        } finally {
            setLoading(false);
        }
    }, [contract, provider]);

    useEffect(() => {
        if (!provider || !contract) return;

        getAllNFTs();
        const listener = () => contract.on("TokenListedSuccess", getAllNFTs);
        listener();
        return () => contract.removeAllListeners("TokenListedSuccess");
    }, [contract, getAllNFTs, provider]);

    if (!provider) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-space-900 to-galaxy-900 flex items-center justify-center">
                <div className="text-red-400 text-xl p-6 rounded-2xl bg-red-900/20 border border-red-400/30 backdrop-blur-lg">
                    🔒 Please install MetaMask to enter the marketplace
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-space-900 to-galaxy-900">
          <Navbar />
          
          {/* Main Content Container */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12"> {/* Increased top padding */}
            {/* Header Section */}
            <div className="text-center mb-16 space-y-6"> {/* Reduced bottom margin */}
              <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 animate-text-glow">
                #NFT Marketplace
              </h1>
              <p className="text-xl text-stellar-gray mt-4"> {/* Added margin-top */}
                Explore the frontier of digital collectibles
              </p>
            </div>
      
            {/* Content Section */}
            <div className="relative mt-8"> {/* Added top margin */}
              {/* Grid Background Effect */}
              <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      
              {/* Loading State */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3].map((_, index) => (
                    <div key={index} className="animate-pulse h-[480px] rounded-2xl bg-galaxy-800/40 border border-stellar-border/30 backdrop-blur-lg">
                      <div className="h-60 bg-galaxy-700/30 rounded-t-2xl" />
                      <div className="p-6 space-y-4">
                        <div className="h-6 bg-galaxy-700/30 rounded w-3/4" />
                        <div className="h-4 bg-galaxy-700/30 rounded w-1/2" />
                        <div className="h-12 bg-galaxy-700/30 rounded-xl mt-4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* NFT Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {data.map((nft, index) => (
                    <NFTTile 
                      key={index}
                      data={nft}
                      className="transform transition-all duration-500 hover:scale-[1.02] hover:shadow-cyber"
                    />
                  ))}
                </div>
              )}
      
              {/* Empty State */}
              {!loading && data.length === 0 && (
                <div className="text-center py-24 space-y-6">
                  <div className="text-3xl text-stellar-gray">
                    🚀 The marketplace is currently empty
                  </div>
                  <div className="text-stellar-gray/70">
                    Be the pioneer to launch your digital creation into the metaverse
                  </div>
                  <div className="animate-float">
                    <div className="w-24 h-24 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full mx-auto blur-xl" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }