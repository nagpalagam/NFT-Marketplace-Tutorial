import logo from './logo_2.png';
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
    <div className="fixed w-full top-0 z-50">
      <nav className="bg-gradient-to-r from-gray-900/90 to-space-900/90 backdrop-blur-xl border-b border-stellar-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section - Logo */}
            <div className="flex-shrink-0 flex items-center space-x-4">
              <Link to="/" className="flex items-center group">
                <img
                  src={fullLogo}
                  alt="Logo"
                  className="h-12 w-12 transition-transform duration-300 group-hover:rotate-12"
                />
                <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  NFT Marketplace
                </span>
              </Link>
            </div>

            {/* Center Section - Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                to="/" 
                className={`relative px-3 py-2 text-lg font-medium ${
                  location.pathname === "/" 
                    ? "text-cyan-400" 
                    : "text-gray-300 hover:text-white"
                } transition-colors duration-300`}
              >
                Marketplace
                {location.pathname === "/" && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 animate-underline" />
                )}
              </Link>

              <Link 
                to="/sellNFT" 
                className={`relative px-3 py-2 text-lg font-medium ${
                  location.pathname === "/sellNFT" 
                    ? "text-cyan-400" 
                    : "text-gray-300 hover:text-white"
                } transition-colors duration-300`}
              >
                List NFT
                {location.pathname === "/sellNFT" && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 animate-underline" />
                )}
              </Link>

              <Link 
                to="/profile" 
                className={`relative px-3 py-2 text-lg font-medium ${
                  location.pathname === "/profile" 
                    ? "text-cyan-400" 
                    : "text-gray-300 hover:text-white"
                } transition-colors duration-300`}
              >
                Profile
                {location.pathname === "/profile" && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 animate-underline" />
                )}
              </Link>
            </div>

            {/* Right Section - Wallet */}
            <div className="flex items-center space-x-4">
              <button
                onClick={connectWallet}
                className={`px-6 py-2 rounded-xl font-bold transition-all duration-300 ${
                  connected
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 cursor-default"
                    : "bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 hover:shadow-cyber-glow"
                }`}
              >
                {connected ? "✅ Connected" : "Connect Wallet"}
              </button>

              {currAddress !== "0x" && (
                <div className="hidden md:flex items-center px-4 py-2 bg-gray-800/30 rounded-full text-sm font-mono border border-stellar-border/50">
                  <span className="text-cyan-400">{currAddress.substring(0, 6)}</span>
                  <span className="mx-1 text-gray-400">...</span>
                  <span className="text-purple-400">{currAddress.substring(currAddress.length - 4)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Address Display */}
      {currAddress !== "0x" && (
        <div className="md:hidden text-center py-2 text-xs bg-gray-900/50">
          <span className="text-cyan-400">Connected: </span>
          <span className="text-gray-300 font-mono">
            {currAddress.substring(0, 12)}...{currAddress.slice(-4)}
          </span>
        </div>
      )}
    </div>
  );
}

export default Navbar;
