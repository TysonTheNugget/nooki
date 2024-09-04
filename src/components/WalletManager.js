// src/components/WalletManager.js
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useWallet } from './useWallet';
import { useInscriptions } from './useInscriptions';

const WalletManager = ({ onDeployNooki, setSelectedNooki, setAccount }) => {
    const walletContainerRef = useRef(null);
    const [dragging, setDragging] = useState(false);
    const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });
    const { walletConnected, account, walletVisible, connectWallet, toggleWalletVisibility, copyAddressToClipboard } = useWallet();
    const { inscriptions, selectedNooki, handleSelectNooki } = useInscriptions(account);

    // Pass account and selectedNooki back to NookiForest
    useEffect(() => {
        setAccount(account);
        setSelectedNooki(selectedNooki);
    }, [account, selectedNooki, setAccount, setSelectedNooki]);

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
        <div>
            {!walletConnected ? (
                <button className="wallet-button" onClick={connectWallet}>Connect UniSat Wallet</button>
            ) : (
                <button className="wallet-button" onClick={toggleWalletVisibility}>
                    {walletVisible ? 'Hide Wallet' : 'Show Wallet'}
                </button>
            )}

            {walletVisible && (
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
                                        onClick={() => handleSelectNooki(id)}
                                    />
                                ))
                            )}
                        </div>
                        {selectedNooki && (
                            <div>
                                <p>Selected Nooki ID: {selectedNooki}</p>
                                <button onClick={onDeployNooki}>Deploy</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WalletManager;
