// import express from "express";
// import { createServer } from "http";
// import { Server } from "socket.io";
// import { YSocketIO } from "y-socket.io/dist/server";

// const app = express();

// app.use(express.static("public"));
// const httpServer = createServer(app);

// const io = new Server(httpServer, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });

// const ysocket = new YSocketIO(io);
// ysocket.initialize();
 

// app.get("/", (req, res) => {
//   res.sendFile(path.resolve("dist/index.html"));
// });

// // app.get("/", (req, res) => {
// //   res.status(200).json({
// //     message: "Hello World",
// //     success: true,
// //   });
// // });

// app.get("/health", (req, res) => {
//   res.status(200).json({
//     message: "ok",
//     success: true,
//   });
// });

// httpServer.listen(3000, () => {
//   console.log("Server is running on port 3000");
// });


import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { YSocketIO } from "y-socket.io/dist/server";
import { exec } from "child_process";
import fs from "fs";
import cors from "cors";
import os from "os";

const app = express();         // ← app is created FIRST

app.use(cors());               // ← then middlewares
app.use(express.json());
app.use(express.static("public"));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const ysocket = new YSocketIO(io);
ysocket.initialize();


app.post("/run", (req, res) => {
  const { language, code } = req.body;

  const tmpDir = os.tmpdir();  // ← on Windows this gives C:\Users\...\AppData\Local\Temp

  const config = {
    javascript: { file: `${tmpDir}/temp.js`, cmd: `node ${tmpDir}/temp.js` },
    python:     { file: `${tmpDir}/temp.py`, cmd: `python ${tmpDir}/temp.py` },
  
  typescript: {
    file: `${tmpDir}/temp.ts`,
    cmd: `npx ts-node ${tmpDir}/temp.ts`,
  },

  

 cpp: {
  file: `${tmpDir}/temp.cpp`,
  cmd: `g++ "${tmpDir}/temp.cpp" -o "${tmpDir}/temp.exe" && "${tmpDir}/temp.exe"`
},

  c: {
    file: `${tmpDir}/temp.c`,
    cmd: `gcc ${tmpDir}/temp.c -o ${tmpDir}/temp && ${tmpDir}/temp`,
  },

  java: {
    file: `${tmpDir}/Main.java`,
    cmd: `javac ${tmpDir}/Main.java && java -cp ${tmpDir} Main`,
  },
};


  const lang = config[language];
  if (!lang) return res.json({ output: "", error: "Language not supported yet" });

  fs.writeFileSync(lang.file, code);

  exec(lang.cmd, { timeout: 5000 }, (error, stdout, stderr) => {
    res.json({
      output: stdout,
      error: stderr || (error ? error.message : ""),
    });
  });
});

app.get("/health", (req, res) => res.status(200).json({ message: "ok" }));

httpServer.listen(3000, () => console.log("Server running on port 3000"));