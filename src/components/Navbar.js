import logo from '../logo_3.png';
import fullLogo from '../full_logo.png';
import {
  BrowserRouter as Router,
  Link,
  useLocation
} from "react-router-dom";
import { useEffect, useState } from 'react';

function Navbar() {
  const [connected, toggleConnect] = useState(false); // Tracks wallet connection status
  const [currAddress, updateAddress] = useState('0x'); // Stores connected wallet address
  const location = useLocation();

  // Function to handle wallet connection
  async function connectWallet() {
    if (window.ethereum) {
      try {
        // Request accounts from the user's wallet
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const walletAddress = accounts[0];
        updateAddress(walletAddress); // Update the state with the connected account
        toggleConnect(true); // Set connected status to true
        localStorage.setItem('connectedWallet', walletAddress); // Save to localStorage
        console.log('Connected wallet address:', walletAddress);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('MetaMask not detected. Please install MetaMask.');
    }
  }

  // Check localStorage for a connected wallet on component mount
  useEffect(() => {
    const savedWallet = localStorage.getItem('connectedWallet');
    if (savedWallet) {
      updateAddress(savedWallet); // Update the state with the saved wallet address
      toggleConnect(true); // Set connected status to true
    }
  }, []); // Empty dependency array ensures this runs only on component mount

  return (
    <div className="">
      <nav className="w-screen">
        <ul className="flex items-end justify-between py-3 bg-transparent text-white pr-5">
          <li className="flex items-end ml-5 pb-2">
            <Link to="/">
              <img
                src={fullLogo}
                alt=""
                width={120}
                height={120}
                className="inline-block -mt-2"
              />
              <div className="inline-block font-bold text-xl ml-2">
                NFT Marketplace
              </div>
            </Link>
          </li>
          <li className="w-2/6">
            <ul className="lg:flex justify-between font-bold mr-10 text-lg">
              <li
                className={
                  location.pathname === "/"
                    ? "border-b-2 hover:pb-0 p-2"
                    : "hover:border-b-2 hover:pb-0 p-2"
                }
              >
                <Link to="/">Marketplace</Link>
              </li>
              <li
                className={
                  location.pathname === "/sellNFT"
                    ? "border-b-2 hover:pb-0 p-2"
                    : "hover:border-b-2 hover:pb-0 p-2"
                }
              >
                <Link to="/sellNFT">List My NFT</Link>
              </li>
              <li
                className={
                  location.pathname === "/profile"
                    ? "border-b-2 hover:pb-0 p-2"
                    : "hover:border-b-2 hover:pb-0 p-2"
                }
              >
                <Link to="/profile">Profile</Link>
              </li>
              <li>
                {/* Connect Wallet Button */}
                <button
                  onClick={connectWallet}
                  className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                >
                  {connected ? "Connected" : "Connect Wallet"}
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
      <div className="text-white text-bold text-right mr-10 text-sm">
        {currAddress !== "0x"
          ? `Connected to ${currAddress.substring(0, 15)}...`
          : "Not Connected. Please login to view NFTs"}
      </div>
    </div>
  );
}

export default Navbar;
