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
  const location = useLocation();

  // Disable and enable button logic
  async function disableButton() {
    const listButton = document.getElementById("list-button");
    listButton.disabled = true;
    listButton.style.backgroundColor = "grey";
    listButton.style.opacity = "0.3";
  }

  async function enableButton() {
    const listButton = document.getElementById("list-button");
    listButton.disabled = false;
    listButton.style.backgroundColor = "#A500FF";
    listButton.style.opacity = "1";
  }

  // Handle file upload
  async function OnChangeFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      disableButton();
      updateMessage("Uploading image.. please don't click anything!");
      const response = await uploadFileToIPFS(file);
      if (response.success === true) {
        enableButton();
        updateMessage("");
        setFileURL(response.pinataURL);
      } else {
        enableButton();
        updateMessage("Failed to upload image: " + response.message);
      }
    } catch (e) {
      enableButton();
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
      disableButton();
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
      enableButton();
      updateMessage("NFT listing successful!");
      updateFormParams({ name: "", description: "", price: "" });
      window.location.replace("/");
    } catch (e) {
      console.error("Error during listing NFT:", e);
      const errorMessage = e?.data?.message || e?.message || "An unknown error occurred";
      alert("Upload error: " + errorMessage);
      updateMessage("Upload error: " + errorMessage);
      enableButton();
    }
  }

  return (
    <div>
      <Navbar />
      <div className="flex flex-col place-items-center mt-10" id="nftForm">
        <form className="bg-white shadow-md rounded px-8 pt-4 pb-8 mb-4">
          <h3 className="text-center font-bold text-purple-500 mb-8">
            Upload your NFT to the marketplace
          </h3>
          <div className="mb-4">
            <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="name">
              NFT Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="name"
              type="text"
              placeholder="Axie#4563"
              onChange={(e) => updateFormParams({ ...formParams, name: e.target.value })}
              value={formParams.name}
            />
          </div>
          <div className="mb-6">
            <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="description">
              NFT Description
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              cols={40}
              rows={5}
              id="description"
              placeholder="Axie Infinity Collection"
              value={formParams.description}
              onChange={(e) => updateFormParams({ ...formParams, description: e.target.value })}
            ></textarea>
          </div>
          <div className="mb-6">
            <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="price">
              Price (in ETH)
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="number"
              placeholder="Min 0.01 ETH"
              step="0.01"
              value={formParams.price}
              onChange={(e) => updateFormParams({ ...formParams, price: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="image">
              Upload Image
            </label>
            <input type="file" onChange={OnChangeFile} />
          </div>
          <br />
          <div className="text-red-500 text-center">{message}</div>
          <button
            onClick={listNFT}
            className="font-bold mt-10 w-full bg-purple-500 text-white rounded p-2 shadow-lg"
            id="list-button"
          >
            List NFT
          </button>
        </form>
      </div>
    </div>
  );
}
