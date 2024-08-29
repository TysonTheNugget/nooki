import { useState, useEffect, useCallback } from 'react'; // Adjust path as necessary
import ordinookiData from '../ordinooki';  // Adjust the path based on the actual location of ordinooki.js

export const useInscriptions = (account) => {
    const [inscriptions, setInscriptions] = useState([]);
    const [selectedNooki, setSelectedNooki] = useState(null);

    // Use useCallback to memoize the function and prevent recreating it on each render
    const loadAndFilterInscriptions = useCallback(async (userAccount) => {
        try {
            let loadedInscriptions = await loadAllInscriptions();
            let validInscriptions = filterValidInscriptions(loadedInscriptions);
            setInscriptions(validInscriptions);

            updateLinkedOrdinookis(validInscriptions);
        } catch (error) {
            console.error('Error loading and filtering inscriptions:', error);
        }
    }, []); // Add other dependencies if necessary, like ordinookiData

    useEffect(() => {
        if (account) {
            loadAndFilterInscriptions(account);
        }
    }, [account, loadAndFilterInscriptions]); // Now include loadAndFilterInscriptions in the dependencies

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

    const updateLinkedOrdinookis = async (validOrdinookiIds) => {
        const token = localStorage.getItem('token');

        if (!token) {
            console.error('No token found. Please log in.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/update-ordinookis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ordinookiIds: validOrdinookiIds,
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

    const handleSelectNooki = (id) => {
        setSelectedNooki(id);
    };

    return {
        inscriptions,
        selectedNooki,
        handleSelectNooki,
    };
};
