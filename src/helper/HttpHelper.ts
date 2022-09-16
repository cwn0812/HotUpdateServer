import express, { application } from "express";
import * as core from 'express-serve-static-core';
import bodyParser from 'body-parser';
import { logMgr } from "../utils/logMgr";

class HttpHelperClass{

    private _httpClient: core.Express = null;

    //开启监听
    startListen(nListenPort: number){
        let app: core.Express = express();
        app.use(bodyParser.urlencoded({
            extended: true,
        }));
        app.use(bodyParser.json());

        app.all('*', function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "*");
            res.header("Access-Control-Allow-Credentials", "*");
            res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
            res.header("X-Powered-By", ' 3.2.1')
            res.header("Content-Type", "application/json;charset=utf-8");
            
            next();
        });
        app.on("error", (err: any) => {
            logMgr.logError("http listening on port={0},errmsg={1}", nListenPort, err.message);
        })
        // end
        app.listen(nListenPort, "0.0.0.0", () => {
            logMgr.logInfo("http listening on port=" + nListenPort);
        });
        this._httpClient = app;
    }

    post(path: string, callback:(req, res)=>void){
        if(!this._httpClient){
            return;
        }

        this._httpClient.post(path, callback);
    }

    get(path: string, callback:(req, res)=> void) {
        if(!this._httpClient) {
            return;
        }
        this._httpClient.get(path, callback);
    }

    use(path: string, callback:(req, res, next) => void) {
        if(!this._httpClient) {
            return;
        }
        this._httpClient.use(path, callback)
    }

}

export const HttpHelper = new HttpHelperClass();
