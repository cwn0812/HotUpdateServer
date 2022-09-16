
import fs from "fs";

interface DownloadSvrConfig{
    nListenPort: number,
}

interface UploadSvrConfig{
    nListenPort: number,
    dstFolderPath: string,
}

class ServerConfigClass{
    private _settingInfo = {};

    constructor(){
        this.init();
    }

    private init(){
        let buffer = fs.readFileSync("./config/server.json");
        let str = buffer.toString();
        this._settingInfo = JSON.parse(str);
    }

    getValue(key: string){
        return this._settingInfo[key];
    }

    getUploadSvrConfig(): UploadSvrConfig{
        return this.getValue("UploadSvrConfig");
    }
    
    getDownloadSvrConfig(): DownloadSvrConfig{
        return this.getValue("DownloadSvrConfig");
    }
    
}

export const ServerConfig = new ServerConfigClass();
