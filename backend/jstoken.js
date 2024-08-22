const jwt = require('jsonwebtoken');

// Your JWT token here
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjZjNTk3YTI5YzUxODU5YTZlYzUzNDU4In0sImlhdCI6MTcyNDM2NTA1NywiZXhwIjoxNzI0MzY4NjU3fQ.6PS2YJCnru02GZaM2QMqchjB2-XKvbJckXAYRMdsoFs';

// Decode the token (this does not verify it, it just decodes the payload)
const decoded = jwt.decode(token);

console.log('Decoded JWT:', decoded);
