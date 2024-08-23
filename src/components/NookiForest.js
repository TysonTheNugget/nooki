import React, { useState, useRef, useEffect, useCallback } from 'react';
import './NookiForest.css';
import ordinookiData from '../ordinooki';  // Import the ordinooki data

const NookiForest = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [walletVisible, setWalletVisible] = useState(false);
  const [inscriptions, setInscriptions] = useState([]);
  const [selectedNooki, setSelectedNooki] = useState(null);
  const walletContainerRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });

const connectWallet = async () => {
  if (typeof window.unisat !== 'undefined') {
    try {
      const accounts = await window.unisat.requestAccounts();
      setAccount(accounts[0]);
      setWalletConnected(true);
      setWalletVisible(true);
      console.log("Wallet connected successfully:", accounts[0]);

      // Separate loading of inscriptions
      loadAndFilterInscriptions(accounts[0]);
    } catch (error) {
      console.error('Error connecting to wallet:', error);
    }
  } else {
    alert('Please install the UniSat Wallet extension!');
  }
};

// Function to load and filter inscriptions
const loadAndFilterInscriptions = async (userAccount) => {
  try {
    let loadedInscriptions = await loadAllInscriptions();
    let validInscriptions = filterValidInscriptions(loadedInscriptions);
    setInscriptions(validInscriptions);

    // Separately update the linked Ordinookis in the database
    updateLinkedOrdinookis(validInscriptions);
  } catch (error) {
    console.error('Error loading and filtering inscriptions:', error);
  }
};

// Function to update linked Ordinookis in the backend
const updateLinkedOrdinookis = async (validOrdinookiIds) => {
  const token = localStorage.getItem('token'); // Retrieve the token from localStorage

  if (!token) {
    console.error('No token found. Please log in.');
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/auth/update-ordinookis', { // Explicitly target port 5000
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Set the Authorization header
      },
      body: JSON.stringify({
        ordinookiIds: validOrdinookiIds,  // These are the valid inscriptions
      }),
    });

    if (response.ok) {
      console.log('Ordinookis linked successfully');
    } else {
      console.error('Failed to link Ordinookis:', response.status);
    }
  } catch (error) {
    console.error('Error updating linked Ordinookis:', error);
  }
};

  const loadAllInscriptions = async () => {
    let allInscriptions = [];
    let page = 0;
    const pageSize = 10;

    try {
      while (true) {
        let inscriptions = await window.unisat.getInscriptions(page * pageSize, pageSize);
        if (inscriptions.list.length === 0) break;
        allInscriptions = allInscriptions.concat(inscriptions.list.map(inscription => inscription.inscriptionId));
        page++;
      }

      return allInscriptions;
    } catch (error) {
      console.error('Error loading inscriptions:', error);
      return [];
    }
  };

  const filterValidInscriptions = (inscriptions) => {
    return inscriptions.filter(id => {
      return ordinookiData.some(nooki => nooki.id === id);
    });
  };

  const handleSelectNooki = (id) => {
    setSelectedNooki(id);  // Set the selected Nooki
  };

  const handleDeployNooki = async () => {
    const token = localStorage.getItem('token'); // Retrieve the token from localStorage

    if (!token) {
      console.error('No token found. Please log in.');
      return;
    }

    if (selectedNooki) {
      const confirmDeploy = window.confirm("Are you sure you want to deploy this Ordinooki?");
      if (confirmDeploy) {
        try {
          const response = await fetch('/api/deploy-nooki', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` // Use the token stored in localStorage
            },
            body: JSON.stringify({ 
              inscriptionId: selectedNooki,
              userId: account // Assuming account is the user's unique identifier
            })
          });

          if (response.ok) {
            console.log('Ordinooki deployed successfully');
            // Update the map with the deployed Ordinooki here
          } else {
            console.error('Failed to deploy Ordinooki', response.status);
            const errorData = await response.json();
            console.error('Error details:', errorData);
          }
        } catch (error) {
          console.error('Error deploying Ordinooki:', error);
        }
      }
    }
  };

  const toggleWalletVisibility = () => {
    setWalletVisible(!walletVisible);
  };

  const copyAddressToClipboard = () => {
    navigator.clipboard.writeText(account);
    alert('Address copied to clipboard!');
  };

  const startDragging = (e) => {
    setDragging(true);
    setInitialPos({
      x: e.clientX - walletContainerRef.current.offsetLeft,
      y: e.clientY - walletContainerRef.current.offsetTop,
    });
  };

  const onDragging = useCallback((e) => {
    if (dragging) {
      walletContainerRef.current.style.left = `${e.clientX - initialPos.x}px`;
      walletContainerRef.current.style.top = `${e.clientY - initialPos.y}px`;
    }
  }, [dragging, initialPos]);

  const stopDragging = () => {
    setDragging(false);
  };

  useEffect(() => {
    document.addEventListener('mousemove', onDragging);
    document.addEventListener('mouseup', stopDragging);

    return () => {
      document.removeEventListener('mousemove', onDragging);
      document.removeEventListener('mouseup', stopDragging);
    };
  }, [onDragging]);

  const shortenAddress = (address) => {
    return `${address.slice(0, 6)}....${address.slice(-6)}`;
  };

  return (
    <div className="nooki-forest">
      <h1>Welcome to Nooki Forest</h1>
      {!walletConnected ? (
        <button onClick={connectWallet}>Connect UniSat Wallet</button>
      ) : (
        <>
          <button onClick={toggleWalletVisibility}>
            {walletVisible ? 'Hide Wallet' : 'Show Wallet'}
          </button>
          <div
            id="walletContainer"
            ref={walletContainerRef}
            className={`wallet-container ${walletVisible ? 'visible' : 'hidden'}`}
          >
            <div
              className="wallet-header draggable"
              onMouseDown={startDragging}
            >
              <h2>Your Wallet</h2>
              <button className="close-btn" onClick={toggleWalletVisibility}>×</button>
            </div>
            <div className="wallet-content">
              <p>
                Address: {shortenAddress(account)}{' '}
                <button onClick={copyAddressToClipboard} className="copy-btn">
                  [Copy Full Address]
                </button>
              </p>
              <div id="nookieImages">
                {inscriptions.length === 0 ? (
                  <p>No valid Nookis found.</p>
                ) : (
                  inscriptions.map(id => (
                    <img
                      key={id}
                      src={`https://ordinals.com/content/${id}`}
                      alt="Nooki"
                      style={{ width: '50px', height: '50px', margin: '5px', cursor: 'pointer' }}
                      onClick={() => handleSelectNooki(id)}  // Select Nooki on click
                    />
                  ))
                )}
              </div>
              {selectedNooki && (
                <div>
                  <p>Selected Nooki ID: {selectedNooki}</p>
                  <button onClick={handleDeployNooki}>Deploy</button>  {/* Confirm deployment */}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NookiForest;
