//app.js says what does the server do?

import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";

const app = express();



//CORS middleware(configuration can be customized as needed)
const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'https://projectcamp-phi.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));

// Additionally, handle preflight explicitly
app.options('*', cors(corsOptions)); // This is crucial!

//To support CORS, you can use this middleware
//Basic configuration for CORS can be added as needed
//this is important, otherwise req.body will be undefined
app.use(express.json({limit: '16kb'}));
app.use(express.urlencoded({extended: true, limit: '16kb'}));
//To serve static files from 'public' directory
// /“If the request is for a file, don’t involve my routes.” 
app.use('/images', express.static('public/images'));
app.use(express.static('public'));
//without this middleware, req.cookies will be undefined
app.use(cookieParser());

//import routes after middleware setup(configuration)
//healthCheckRouter is a placeholder name for the actual router import, same with authRouter
import healthCheckRouter from './routes/healthcheck.routes.js';
import authRouter from "./routes/auth.routes.js"
import projectRouter from "./routes/project.routes.js";
import taskRouter from "./routes/task.routes.js";
import subtaskRouter from "./routes/subtask.routes.js";
import noteRouter from "./routes/note.routes.js";

app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/projects", taskRouter);
app.use("/api/v1/projects", subtaskRouter);
app.use("/api/v1/projects", noteRouter);


app.use((err, req, res, next) => {
	const statusCode = err.statusCode || 500;

	res.status(statusCode).json({
		success: false,
		message: err.message || "Internal Server Error",
	});
});


export default app;
