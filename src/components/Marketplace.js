import Navbar from "./Navbar";
import NFTTile from "./NFTTile";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState, useEffect, useMemo, useCallback } from "react";
import { GetIpfsUrlFromPinata } from "../utils";

export default function Marketplace() {
    const [data, updateData] = useState([]);
    // Hardcode the contract address (you can replace this with a dynamic source if needed)
    const contractAddress = "0x6AeD57D577542A04646eA9b1780adB6288768242";

    const ethers = require("ethers");

    // Provider setup
    const provider = useMemo(() => {
        return typeof window.ethereum !== 'undefined'
            ? new ethers.providers.Web3Provider(window.ethereum)
            : null;
    }, [ethers.providers.Web3Provider]);

    // Contract instantiation with dynamic address
    const contract = useMemo(() => {
        if (!provider) return null;
        return new ethers.Contract(contractAddress, MarketplaceJSON.abi, provider); // Use contractAddress here
    }, [provider, contractAddress, ethers.Contract]);

    // Function to get all NFTs
    const getAllNFTs = useCallback(async () => {
        try {
            const signer = provider.getSigner();
            let contractWithSigner = contract.connect(signer);
            const transaction = await contractWithSigner.getAllNFTs();

            const items = await Promise.all(
                transaction.map(async (i) => {
                    try {
                        const tokenId = i.tokenId.toNumber();
                        let tokenURI = await contractWithSigner.tokenURI(tokenId);
                        
                        // Check if the tokenURI is valid (i.e., not "0x" or empty)
                        if (!tokenURI || tokenURI === "0x") {
                            throw new Error(`Invalid or missing tokenURI for tokenId: ${tokenId}`);
                        }

                        // Convert the tokenURI to a gateway URL (from Pinata)
                        tokenURI = await GetIpfsUrlFromPinata(tokenURI); 
                        let meta = tokenURI;

                        console.log("Fetched metadata for tokenId:", tokenId, "Meta:", meta);

                        // Ensure that the metadata has image, name, and description fields
                        if (!meta.image || !meta.name || !meta.description) {
                            throw new Error(`Missing required metadata fields for tokenId: ${tokenId}`);
                        }

                        let price = ethers.utils.formatUnits(i.price.toString(), "ether");

                        return {
                            price,
                            tokenId,
                            seller: i.seller,
                            owner: i.owner,
                            image: meta.image,
                            name: meta.name,
                            description: meta.description,
                        };
                    } catch (err) {
                        console.error(`Error fetching metadata for tokenId ${i.tokenId}:`, err);
                        return null; // Skip this NFT if metadata can't be fetched
                    }
                })
            );

            // Filter out invalid NFTs and update state
            updateData(items.filter((item) => item !== null));
        } catch (err) {
            console.error("Error fetching NFTs from contract:", err);
        }
    }, [contract, provider, ethers.utils]);

    useEffect(() => {
        if (!provider || !contract) return;

        getAllNFTs();

        const listenForNewNFTs = () => {
            contract.on("TokenListedSuccess", async () => {
                console.log("New NFT listed!");
                await getAllNFTs();
            });
        };

        listenForNewNFTs();

        return () => {
            contract.removeAllListeners("TokenListedSuccess");
        };
    }, [contract, getAllNFTs, provider]);

    if (!provider) {
        alert("Please install a web3 wallet like MetaMask!");
        return null;
    }

    return (
        <div>
            <Navbar />
            <div className="flex flex-col place-items-center mt-20">
                <div className="md:text-xl font-bold text-white">Top NFTs</div>
                <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">
                    {data.map((value, index) => (
                        <NFTTile data={value} key={index} />
                    ))}
                </div>
            </div>
        </div>
    );
}
