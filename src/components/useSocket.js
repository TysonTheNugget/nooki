import { useState, useEffect, useRef } from 'react';

export const useSocket = () => {
    const [deployedNookis, setDeployedNookis] = useState([]);
    const socketRef = useRef(null);

    useEffect(() => {
        // Initialize WebSocket connection to the Python server
        socketRef.current = new WebSocket('ws://localhost:8081');

        // Handle incoming messages from the WebSocket server
        socketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            // Check for the "deploy" event or a similar custom event
            if (data.type === 'deploy') {
                setDeployedNookis((prev) => [...prev, data]);
            }
        };

        // Handle WebSocket connection open event
        socketRef.current.onopen = () => {
            console.log('WebSocket connection established');
        };

        // Handle WebSocket errors
        socketRef.current.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        // Handle WebSocket closure and cleanup
        return () => {
            if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                socketRef.current.close();
            }
        };
    }, []);

    return deployedNookis;
};
