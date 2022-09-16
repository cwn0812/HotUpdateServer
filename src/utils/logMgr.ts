import utils from "./utils";
import fs from "fs";

enum LOG_TYPE{
    DEBUG,
    INFO,
    ERROR,
}

interface WriteInfo{
    nLogType : number,
    str : string,
    time : number,
    stackStr : string,
}

class logMgrClass{
    private _filename = "log";
    private _writeList: WriteInfo[] = [];
    private _bWriteFile = false;

    public init(filename: string){
        this._filename = filename;
        let bExists = fs.existsSync("./logs");
        if (!bExists) {
            fs.mkdirSync("./logs");
        }
    }

    private freshWriteFileList(){
        if (this._writeList.length <= 0) {
            return;
        }
        let writeInfo = this._writeList[0];
        this._writeList = this._writeList.slice(1);
        this._bWriteFile = true;
        this.writeFile(writeInfo, ()=>{
            this._bWriteFile = false;
            this.freshWriteFileList();
        })
    }

    private addWriteFileList(nLogType, str, stackStr){
        let writeInfo = {
            nLogType : nLogType,
            str : str,
            time : utils.getMilTicket(),
            stackStr : stackStr,
        }
        if (!this._bWriteFile) {
            this._bWriteFile = true;
            this.writeFile(writeInfo, ()=>{
                this._bWriteFile = false;
    
                this.freshWriteFileList();
            })
        }
        else{
            this._writeList.push(writeInfo);
        }
    }

    private getLogTypeStr(nLogType: number): string{
        if (nLogType == LOG_TYPE.DEBUG) {
            return "DEBUG";
        }
        else if (nLogType == LOG_TYPE.INFO) {
            return "INFO";
        }
        else if (nLogType == LOG_TYPE.ERROR) {
            return "ERROR";
        }
        return "DEFAUT";
    }

    private writeFile(writeInfo: WriteInfo, callback){
        let filePath = utils.format("./logs/{0}_{1}.log", this._filename, utils.getDayStr(writeInfo.time));
        let fileMsg = utils.format("[{0}] {1} {2}: {3}", 
            this.getLogTypeStr(writeInfo.nLogType), utils.getDateStr(writeInfo.time), writeInfo.stackStr, writeInfo.str);
    
        fs.writeFile(filePath, fileMsg + "\r\n", { flag:'a+' }, (err)=>{
            callback();
        });
    
        if (writeInfo.nLogType == LOG_TYPE.ERROR) {
            console.error(fileMsg);
        }
        else{
            console.log(fileMsg);
        }
    }

    private newPrepareStackTrace(error, structuredStack){
        return structuredStack;
    }

    private getStackStr(){
        var oldPrepareStackTrace = Error.prepareStackTrace;
        Error.prepareStackTrace = this.newPrepareStackTrace;
        var structuredStack = new Error().stack;
        Error.prepareStackTrace = oldPrepareStackTrace;
        var caller: any = structuredStack[2];

        var lineSep = process.platform == 'win32' ? '\\' : '/';
        var fileNameSplited = caller.getFileName().split(lineSep);
        var fileName = fileNameSplited[fileNameSplited.length - 1];
        var lineNumber = caller.getLineNumber();
        var columnNumber = caller.getColumnNumber();

        return utils.format("{0} {1}行", fileName, lineNumber);
    }

    public logError(str, ...args){
        let msg = utils.formatex(str, args);
        let stackStr = this.getStackStr();
        this.addWriteFileList(LOG_TYPE.ERROR, msg, stackStr);
    }
    public logInfo(str, ...args){
        let msg = utils.formatex(str, args);
        let stackStr = this.getStackStr();
        this.addWriteFileList(LOG_TYPE.INFO, msg, stackStr);
    }
    public logDebug(str, ...args){
        let msg = utils.formatex(str, args);
        let stackStr = this.getStackStr();
        this.addWriteFileList(LOG_TYPE.DEBUG, msg, stackStr);
    }
}

export const logMgr: logMgrClass = new logMgrClass(); 
