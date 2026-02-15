//Index.js says when do we start the server?

import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './db/mongodb.js';
dotenv.config({
    path: "./.env" //It loads key=value pairs from .env into process.env
});

const port = process.env.PORT || 3000;

connectDB()
    .then(() => {
        app.listen(port, () => {
        console.log(`Example app listening on port http://localhost:${port}`)
})
    })
    .catch((err) => {
        console.error("Failed to connect to the database:", err);
        process.exit(1); // Exit process with failure
    });