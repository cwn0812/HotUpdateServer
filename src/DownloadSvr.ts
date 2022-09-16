
import express from "express";
import path from "path";
import fs from "fs";
import { logMgr } from "./utils/logMgr";
import { ServerConfig } from "./ServerConfig";

process.on('uncaughtException',function(err){
    logMgr.logError(err.stack);
});

class DownloadSvrClass{
    constructor(){
        this.init();
        this.start();
    }

    private init(){
        logMgr.init("DownloadSvr");
    }

    private start(){
        let server = express();
        let cwdPath = "./www_root";
        if(!fs.existsSync(cwdPath)){
            fs.mkdirSync(cwdPath);
        }
        server.use(express.static(cwdPath));
        logMgr.logInfo("workdir:"+cwdPath);

        let svrConfig = ServerConfig.getDownloadSvrConfig();
        server.on("error", (err: any)=>{
            logMgr.logError("DownloadSvr listening on port={0},errmsg={1}", svrConfig.nListenPort, err.message);
        });

        server.listen(svrConfig.nListenPort, ()=>{
            logMgr.logInfo("DownloadSvr listening on port="+svrConfig.nListenPort);
        });

    }
}

export const DownloadSvr = new DownloadSvrClass();
