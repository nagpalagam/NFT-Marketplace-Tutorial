import logo from './logo_2.png';
import fullLogo from '../full_logo.png';
import {
  BrowserRouter as Router,
  Link,
  useLocation
} from "react-router-dom";
import { useEffect, useState } from 'react';
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider"; // For WalletConnect support

// Provider options for Web3Modal
const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider, // Use WalletConnect provider
    options: {
      infuraId: "93f07f7c79e84ab88be55d163eca9a57", // Your Infura Project ID
      network: "sepolia", // Use Sepolia testnet
    },
  },
  // Add other providers like MetaMask, etc., if needed
};

const web3Modal = new Web3Modal({
  network: "sepolia", // Set the default network to Sepolia
  cacheProvider: true, // Optional: Cache the provider for reconnection
  providerOptions, // Pass the provider options
});

function Navbar() {
  const [connected, toggleConnect] = useState(false); // Tracks wallet connection status
  const [currAddress, updateAddress] = useState('0x'); // Stores connected wallet address
  const location = useLocation();

  // Function to handle wallet connection and disconnection
  async function connectWallet() {
    if (connected) {
      // Disconnect wallet
      await web3Modal.clearCachedProvider(); // Clear the cached provider
      toggleConnect(false); // Set connected status to false
      updateAddress('0x'); // Reset the wallet address
      localStorage.removeItem('connectedWallet'); // Remove wallet address from localStorage
      console.log('Wallet disconnected');
    } else {
      // Connect wallet
      try {
        const provider = await web3Modal.connect();
        const web3 = new Web3(provider);

        // Subscribe to provider events
        provider.on("accountsChanged", (accounts) => {
          console.log("Accounts changed:", accounts);
          updateAddress(accounts[0] || '0x');
        });

        provider.on("chainChanged", (chainId) => {
          console.log("Chain ID changed:", chainId);
          // Reload the page if the chain changes
          window.location.reload();
        });

        provider.on("connect", (info) => {
          console.log("Connected:", info);
        });

        provider.on("disconnect", (error) => {
          console.log("Disconnected:", error);
          toggleConnect(false);
          updateAddress('0x');
        });

        const accounts = await web3.eth.getAccounts();
        const walletAddress = accounts[0];
        updateAddress(walletAddress); // Update the state with the connected account
        toggleConnect(true); // Set connected status to true
        localStorage.setItem('connectedWallet', walletAddress); // Save to localStorage
        console.log('Connected wallet address:', walletAddress);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
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
          {/* Flex container for horizontal layout */}
          <div className="flex flex-row items-center justify-between h-16">
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
            <div className="flex flex-row items-center space-x-4 md:space-x-8">
              <Link 
                to="/" 
                className={`relative px-3 py-2 text-sm md:text-lg font-medium ${
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
                className={`relative px-3 py-2 text-sm md:text-lg font-medium ${
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
                className={`relative px-3 py-2 text-sm md:text-lg font-medium ${
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
            <div className="flex flex-row items-center space-x-4">
              <button
                onClick={connectWallet}
                className={`px-4 py-2 md:px-6 md:py-2 rounded-xl font-bold transition-all duration-300 ${
                  connected
                    ? "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500" // Disconnect button style
                    : "bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 hover:shadow-cyber-glow" // Connect button style
                }`}
              >
                {connected ? "Disconnect" : "Connect Wallet"}
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