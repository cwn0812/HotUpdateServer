import crypto from "crypto";
import * as urlMgr from "url";
import http from "http";
import https from "https";

export default class utils {

    public static getMilTicket(): number {//获取毫秒时间撮
        return new Date().getTime();
    }

    public static getTicket(): number {//获取当前时间撮
        return Math.floor(this.getMilTicket() / 1000);
    }

    public static getTodayTicket() { //获取今天的开始时间撮
        let date = new Date();
        date.setHours(0, 0, 0, 0);
        return Math.floor(date.getTime() / 1000);
    }

    public static getYesterdayTicket() { //获取昨天的开始时间撮
        return this.getTodayTicket() - 24 * 60 * 60;
    }

    public static getThisWeekTicket() { //获取这周开始时间撮
        let date = new Date();
        date.setHours(0, 0, 0, 0);
        let day = date.getDay();
        if (day == 0) {//周日
            day = 7;
        }
        return Math.floor(date.getTime() / 1000) - 24 * 60 * 60 * (day - 1);
    }

    public static getLastWeekTicket() { //获取上周开始时间撮
        return this.getThisWeekTicket() - 24 * 60 * 60 * 7;
    }

    public static md5(data) {
        var md5 = crypto.createHash("md5");
        md5.update(data);
        return md5.digest('hex');
    }

    public static format(msg: string, ...args) {
        return msg.replace(/\{(\d+)\}/g, function (match, index) {
            if (args.length > index) {
                return args[index];
            } else {
                return "";
            }
        });
    }

    public static formatex(msg: string, args = null) {
        if (!args) {
            return msg;
        }
        return msg.replace(/\{(\d+)\}/g, function (match, index) {
            if (args.length > index) {
                return args[index];
            } else {
                return "";
            }
        });
    }

    public static formateDate(date: Date, fmt: string): string {
        var o = {
            "y+": date.getFullYear(), //年份
            "M+": date.getMonth() + 1, //月份
            "d+": date.getDate(), //日
            "H+": date.getHours(), //小时
            "m+": date.getMinutes(), //分
            "s+": date.getSeconds(), //秒
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度
            "S+": date.getMilliseconds() //毫秒
        };
        for (var k in o){
            if (new RegExp("(" + k + ")").test(fmt)) {
                let str = "" + o[k];
                for (let index = 0; index < RegExp.$1.length - str.length; index++) {
                    str = "0" + str;
                }
                if(str.length > RegExp.$1.length){
                    str = str.substring(str.length - RegExp.$1.length);
                }
                fmt = fmt.replace(RegExp.$1, str);
            }
        }
        return fmt;
    }

    public static getDateStr(tmMilTicket: number = 0): string {
        var date = new Date();
        if (tmMilTicket > 0) {
            date.setTime(tmMilTicket);
        }
        return this.formateDate(date, "yyyy-MM-dd HH:mm:ss");
    }

    public static getDayStr(tmMilTicket: number = 0): string {
        var date = new Date();
        if (tmMilTicket > 0) {
            date.setTime(tmMilTicket);
        }
        return this.formateDate(date, "yyyyMMdd");
    }

    public static getSqlDateStr(tmTicket): string {
        var date = new Date();
        date.setTime(tmTicket * 1000);
        return this.formateDate(date, "yyyy-MM-dd HH:mm:ss.000");
    }

    public static getDay(tmTicket: number): number {
        let date = new Date();
        date.setTime(tmTicket * 1000);
        return this.getDayByDate(date);
    }

    public static getDayByDate(date: Date): number {
        return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
    }

    public static getRandomNum(begin: number, end: number) {
        var num = begin + Math.random() * (end - begin + 1);
        num = Math.floor(num);
        if (num > end) {
            num = end;
        }
        return num;
    }

    public static getRandomStr(len = 16): string {
        var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz12345678';

        var maxPos = $chars.length;
        var str = '';
        for (var i = 0; i < len; i++) {
            str += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return str;
    }

    public static getRandomNumStr(len = 16): string {
        var $chars = '0123456789';
        var maxPos = $chars.length;
        var str = '';
        for (var i = 0; i < len; i++) {
            str += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return str;
    }

    public static getIp(req): string {
        var ipStr = req.headers['X-Real-IP'] || req.headers['x-forwarded-for'];
        if (ipStr) {
            var ipArray = ipStr.split(",");
            if (ipArray || ipArray.length > 0) { //如果获取到的为ip数组
                return ipArray[0];
            }
        }

        if (typeof (req.ip) == "string") {
            return req.ip;
        }
        return "";
    }


    public static ipv6ToIpv4(ipv6: string): string {
        let strList = ipv6.split(":");
        if (strList.length > 0) {
            return strList[strList.length - 1];
        }
        return "";
    }

    public static ipv4ToNum(ipv4: string): number { //使用int32存
        var num = 0;
        if (ipv4 == "") {
            return num;
        }
        var aNum = ipv4.split(".");
        if (aNum.length != 4) {
            return num;
        }
        num += parseInt(aNum[3]) << 24;
        num += parseInt(aNum[2]) << 16;
        num += parseInt(aNum[1]) << 8;
        num += parseInt(aNum[0]) << 0;
        num = num >>> 0;//这个很关键，不然可能会出现负数的情况
        return this.uintToInt32(num);
    }

    public static numToIpv4(ip: number): string { //ip是使用int32存
        ip = this.intToUInt32(ip);
        var ipv4 = "";
        if (ip <= 0) {
            return ipv4;
        }
        var ip3 = (ip << 0) >>> 24;
        var ip2 = (ip << 8) >>> 24;
        var ip1 = (ip << 16) >>> 24;
        var ip0 = (ip << 24) >>> 24
        ipv4 += ip0 + "." + ip1 + "." + ip2 + "." + ip3;
        return ipv4;
    }

    public static intToUInt32(num: number): number {
        let buffer = Buffer.allocUnsafe(16);
        buffer.writeInt32BE(num, 0);
        num = buffer.readUInt32BE(0);
        return num;
    }

    public static uintToInt32(num: number): number {
        let buffer = Buffer.allocUnsafe(16);
        buffer.writeUInt32BE(num, 0);
        num = buffer.readInt32BE(0);
        return num;
    }

    public static httpGet(requestUrl: string, body: any, callback: (bSuccess: boolean, data: any) => void, contentType = "application/json; charset=utf-8", headerList = null) {
        let parsedUrl = urlMgr.parse(requestUrl);
        let bHttps = parsedUrl.protocol == "https:";
        let httpTemp = bHttps ? https : http;
        let port = bHttps ? 443 : 80;
        if (parsedUrl.port) {
            port = parseInt(parsedUrl.port);
        }
        if (body) {
            let nIndex = 0;
            for (const key in body) {
                let value = body[key];
                if (nIndex == 0) {
                    parsedUrl.path += "?" + key + "=" + value;
                }
                else {
                    parsedUrl.path += "&" + key + "=" + value;
                }
                ++nIndex;
            }
        }

        let options = {
            hostname: parsedUrl.hostname,
            port: port,
            path: parsedUrl.path,
            method: 'GET',
            headers: {
                'Content-Type': contentType,
            }
        }
        if (headerList) {
            for (const key in headerList) {
                options.headers[key] = headerList[key];
            }
        }
        var req = httpTemp.request(options, function (res) {
            // res.setEncoding('utf-8');
            var _data = '';
            res.on('data', function (chunk) {
                _data += chunk;
            });
            res.on('end', function () {
                let bJson = false;
                let str = res.headers["content-type"];
                if (typeof (str) == "string" && str.indexOf("json") >= 0) {
                    bJson = true;
                }
                if (res.statusCode == 200) {
                    if (bJson) {
                        callback(true, JSON.parse(_data));
                    }
                    else {
                        callback(true, _data);
                    }
                }
                else {
                    console.log("httpGet error:", requestUrl, res.statusCode, _data, body, headerList);
                    if (bJson) {
                        callback(false, JSON.parse(_data));
                    }
                    else {
                        callback(false, _data);
                    }
                }
            });
            res.on('error', function (e) {
                callback(false, e.message);
            });
        });
        req.on('error', function (e) {
            callback(false, e.message);
        });
        req.end();
    }

    public static httpPost(requestUrl: string, body: any, callback: (bSuccess: boolean, data: any) => void, contentType = "application/json; charset=utf-8", headerList = null) {
        let parsedUrl = urlMgr.parse(requestUrl);
        let bHttps = parsedUrl.protocol == "https:";
        let httpTemp = bHttps ? https : http;
        let port = bHttps ? 443 : 80;
        if (parsedUrl.port) {
            port = parseInt(parsedUrl.port);
        }
        let content = '';
        if (contentType.indexOf("json") >= 0) {
            content = JSON.stringify(body);
        }
        let len1 = Buffer.byteLength(content, 'utf8');
        let options = {
            hostname: parsedUrl.hostname,
            port: port,
            path: parsedUrl.path,
            method: 'POST',
            headers: {
                'Content-Type': contentType,
                'Content-Length': len1,
            }
        }
        if (headerList) {
            for (const key in headerList) {
                options.headers[key] = headerList[key];
            }
        }
        var req = httpTemp.request(options, function (res) {
            res.setEncoding('utf-8');
            var _data = '';
            res.on('data', function (chunk) {
                _data += chunk;
            });
            res.on('end', function () {
                let bJson = false;
                let str = res.headers["content-type"];
                if (typeof (str) == "string" && str.indexOf("json") >= 0) {
                    bJson = true;
                }
                if (res.statusCode == 200) {
                    if (bJson) {
                        callback(true, JSON.parse(_data));
                    }
                    else {
                        callback(true, _data);
                    }
                }
                else {
                    console.log("httpPost error:", requestUrl, res.statusCode, _data, body, headerList);
                    if (bJson) {
                        callback(false, JSON.parse(_data));
                    }
                    else {
                        callback(false, _data);
                    }
                }
            });
            res.on('error', function (e) {
                callback(false, e.message);
            });
        });
        req.on('error', function (e) {
            callback(false, e.message);
        });
        req.write(content);
        req.end();
    }

}


