import asyncio
import websockets
import json

players = {}  # Dictionary to store player information
connected_clients = set()  # Set to keep track of connected clients

UPDATE_INTERVAL = 0.04  # Update interval in seconds

async def broadcast_game_state():
    """Broadcast the game state to all connected clients."""
    game_state = {"type": "state", "players": players}
    if connected_clients:  # Check if there are any clients connected
        await asyncio.gather(*(client.send(json.dumps(game_state)) for client in connected_clients), return_exceptions=True)

async def update_positions():
    """Update player positions based on velocity and broadcast game state periodically."""
    while True:
        for player_id, player in players.items():
            player['x'] += player['vx'] * UPDATE_INTERVAL
            player['y'] += player['vy'] * UPDATE_INTERVAL

        await broadcast_game_state()
        await asyncio.sleep(UPDATE_INTERVAL)

async def handle_connection(websocket, path):
    """Handle new player connections and manage their state."""
    player_id = str(id(websocket))
    players[player_id] = {'x': 400, 'y': 300, 'direction': 'stand', 'vx': 0, 'vy': 0}

    # Add the new client
    connected_clients.add(websocket)

    # Send initial game state to the newly connected player
    await websocket.send(json.dumps({'type': 'init', 'id': player_id, 'players': players}))

    # Inform all other players about the new player
    await broadcast_game_state()

    try:
        async for message in websocket:
            data = json.loads(message)
            if data['type'] == 'move':
                players[data['id']]['vx'] = data.get('vx', 0)
                players[data['id']]['vy'] = data.get('vy', 0)
                players[data['id']]['direction'] = data.get('direction', 'stand')
                players[data['id']]['x'] = data.get('x', players[data['id']]['x'])
                players[data['id']]['y'] = data.get('y', players[data['id']]['y'])
    except websockets.exceptions.ConnectionClosed:
        print(f"Connection with {player_id} closed.")
    finally:
        # Handle player disconnection
        del players[player_id]
        connected_clients.remove(websocket)
        await broadcast_game_state()

async def main():
    """Start the WebSocket server and run the update loop."""
    async with websockets.serve(handle_connection, "localhost", 8081):
        print('WebSocket server started on ws://localhost:8081')

        # Run update_positions loop concurrently with the WebSocket server
        await update_positions()

if __name__ == "__main__":
    asyncio.run(main())
