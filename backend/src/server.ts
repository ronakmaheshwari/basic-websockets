// import cluster from "node:cluster";
// import os from "node:os";
// // import http from "http";
// import { app } from "./index.js";

// const totalCpus = os.cpus().length;
// // export const server = http.createServer(app)

// if(cluster.isPrimary){
    
//     for(let i=0;i<totalCpus;i++){
//         cluster.fork();
//     }

//     cluster.on("exit",() => {
//         cluster.fork();
//     });
// }else{
//     app.listen(3000, () => {
//         console.log("HTTP server running on port 3000");
//     });
// }