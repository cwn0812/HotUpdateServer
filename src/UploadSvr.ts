import { HttpHelper } from "./helper/HttpHelper";
import { ServerConfig } from "./ServerConfig";
import multiparty from "multiparty";
import fs from 'fs';
import compressing from "compressing";
import { logMgr } from "./utils/logMgr";

class UploadSvrClass{
    constructor(){
        this.init();
        this.start();
    }

    init(){
        let path = './uploads';
        if(!fs.existsSync(path)){
            fs.mkdirSync(path);
        }
        logMgr.init("upload");
    }

    start(){
        HttpHelper.startListen(ServerConfig.getUploadSvrConfig().nListenPort);
        HttpHelper.post("/uploadZip", this.uploadZip.bind(this));
    }
    
    async uploadZip(req, res){
        var form = new multiparty.Form();
        var msg = { errcode: 0};
        let body = req.body;
        form.encoding = 'utf-8';
        form.uploadDir = "./uploads";
    
        //设置单文件大小限制
        // form.maxFilesSize = 2 * 1024 * 1024;
        //form.maxFields = 1000;  设置所以文件的大小总和
        res.writeHead(200,{"Content-type":"application/json; charset=utf-8"});
        form.parse(req, function(err, fields, files) {
            if(err){
                msg.errcode = 1;
                res.end(JSON.stringify(msg));
                logMgr.logError("uploadZip error1");
                return ;
            }
            console.log(files.file[0].originalFilename);
            let filePath = files.file[0].path;
            let channel = fields["channel"][0];
            let version = fields["version"][0];
            logMgr.logInfo(`uploadZip body: filePath=${filePath},channel=${channel},version=${version},`);
            let dstFolderPath = ServerConfig.getUploadSvrConfig().dstFolderPath;
            let dstPath = dstFolderPath + "/" + channel;
            if (!fs.existsSync(dstPath)) {
                fs.mkdirSync(dstPath);
            }
            let history = dstFolderPath + "/history";
            if (!fs.existsSync(history)) {
                fs.mkdirSync(history);
            }
            history = history + "/" + channel;
            if (!fs.existsSync(history)) {
                fs.mkdirSync(history);
            }

            compressing.zip.uncompress(filePath, dstPath).then(()=>{
                res.end(JSON.stringify(msg));
                logMgr.logInfo(`uploadZip success,${filePath},${channel},${dstPath}`);
                // fs.rmSync(filePath);
                fs.renameSync(filePath, history + "/" + version + ".zip");
            }).catch((err)=>{
                msg.errcode = 1;
                res.end(JSON.stringify(msg));
                logMgr.logError(`uploadZip error2,${filePath},${channel},${dstPath}`);
            });
        });
    }

}

export const UploadSvr = new UploadSvrClass();
