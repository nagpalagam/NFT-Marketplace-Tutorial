const { ethers } = require("hardhat");
const Marketplace = require("../src/Marketplace.json");

async function createToken() {
  const MyContract = await ethers.getContractFactory("NFTMarketplace");
  const contract = await MyContract.attach(Marketplace.address);

  const tokenURI = ""; // Replace with actual token URI
  const price = ethers.utils.parseEther("0.1"); // Set a price for the token

  const tx = await contract.createToken(tokenURI, price, { value: ethers.utils.parseEther("0.01") });
  console.log("Transaction Hash:", tx.hash);

  await tx.wait();
  console.log("Token created successfully.");
}

async function checkNFTListing() {
  const MyContract = await ethers.getContractFactory("NFTMarketplace");
  const contract = await MyContract.attach(Marketplace.address);

  const myNFTs = await contract.getMyNFTs();
  console.log("My NFTs:", myNFTs);

  const allNFTs = await contract.getAllNFTs();
  console.log("All NFTs in Marketplace:", allNFTs);
}

async function getNFts() {
  try {
    await createToken();
    await checkNFTListing();
  } catch (error) {
    console.error("Error interacting with the contract:", error);
  }
}

getNFts();
