import { useState } from 'react';

export const useWallet = () => {
    const [walletConnected, setWalletConnected] = useState(false);
    const [account, setAccount] = useState(null);
    const [walletVisible, setWalletVisible] = useState(false);

    const connectWallet = async () => {
        if (typeof window.unisat !== 'undefined') {
            try {
                const accounts = await window.unisat.requestAccounts();
                setAccount(accounts[0]);
                setWalletConnected(true);
                setWalletVisible(true);
                console.log("Wallet connected successfully:", accounts[0]);
            } catch (error) {
                console.error('Error connecting to wallet:', error);
            }
        } else {
            alert('Please install the UniSat Wallet extension!');
        }
    };

    const toggleWalletVisibility = () => {
        setWalletVisible(!walletVisible);
    };

    const copyAddressToClipboard = () => {
        navigator.clipboard.writeText(account);
        alert('Address copied to clipboard!');
    };

    return {
        walletConnected,
        account,
        walletVisible,
        connectWallet,
        toggleWalletVisibility,
        copyAddressToClipboard,
    };
};
