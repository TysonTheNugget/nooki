import { useState, useEffect } from 'react';
import io from 'socket.io-client';

export const useSocket = () => {
    const [deployedNookis, setDeployedNookis] = useState([]);

    useEffect(() => {
        const socket = io('http://localhost:5000');

        socket.on('nookiDeployed', (data) => {
            setDeployedNookis((prev) => [...prev, data]);
        });

        return () => socket.disconnect();
    }, []);

    return deployedNookis;
};
