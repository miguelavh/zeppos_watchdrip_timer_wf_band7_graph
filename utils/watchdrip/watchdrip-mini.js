/// <reference path="../../.types/index.d.ts" />

import {getGlobal} from "../../shared/global";

import {
    WATCHDRIP_APP_ID,
    WF_INFO,
    WF_INFO_LAST_UPDATE,
    WF_INFO_LAST_UPDATE_SUCCESSFUL
} from "../config/global-constants";

import {str2json} from "../../shared/data";

import {MessageBuilder} from "../../shared/message";

import {
    Commands,
    DATA_AOD_TIMER_UPDATE_INTERVAL_MS,
    DATA_AOD_UPDATE_INTERVAL_MS,
    DATA_STALE_TIME_MS,
    DATA_TIMER_UPDATE_INTERVAL_MS,
    DATA_UPDATE_INTERVAL_MS,
    XDRIP_UPDATE_INTERVAL_MS
} from "../config/constants";

import {WatchdripData} from "./watchdrip-data";


export const logger = Logger.getLogger("wf-wathchdrip");

export class Watchdrip {
    constructor() {
        this.screenType = hmSetting.getScreenType();

        this.updateIntervals = this.screenType === hmSetting.screen_type.AOD ? DATA_AOD_UPDATE_INTERVAL_MS : DATA_UPDATE_INTERVAL_MS;

        this.globalNS = getGlobal();
        this.timeSensor = hmSensor.createSensor(hmSensor.id.TIME);
        this.watchdripData = new WatchdripData(this.timeSensor);

        this.messageBuilder = getApp()._options.globalData.messageBuilder;

        this.lastInfoUpdate = 0;
        this.lastUpdateAttempt = 0;
        this.lastUpdateSuccessful = false;
        this.fetchNewData = false;
        this.updatingData = false;
        this.renewMB = false;
        this.connectionActive = false;

        this.intervalTimer = null;

        this.updateTimesWidgetCallback = null;
        this.updateValuesWidgetCallback = null;
        this.onUpdateStartCallback = null;
        this.onUpdateFinishCallback = null;
    }

    startTimerDataUpdates() {
        if (this.intervalTimer !== null) return; //already started
        
        const interval = this.isAOD() ? DATA_AOD_TIMER_UPDATE_INTERVAL_MS : DATA_TIMER_UPDATE_INTERVAL_MS;

        logger.log("startTimerDataUpdates, interval: " + interval);
        
        this.intervalTimer = this.globalNS.setInterval(() => {
            this.checkUpdates();
        }, interval);
    }

    stopTimerDataUpdates() {
        if (this.intervalTimer !== null) {
            logger.log("stopTimerDataUpdates");
            this.globalNS.clearInterval(this.intervalTimer);
            this.intervalTimer = null;
        }
    }

    isAOD(){
        return this.screenType === hmSetting.screen_type.AOD;
    }

    checkUpdates() {
        logger.log("CHECK_UPDATES");

        this.fetchNewData = false;

        this.readInfo();

        this.updateWidgets();
        
        if (this.updatingData) {
            logger.log("alreday fetching. doing nothing.");
            return;
        }

        const utc = this.timeSensor.utc;

        if (this.lastUpdateSuccessful) {
            const bgTimeOlder = utc - this.watchdripData.getBg().time > XDRIP_UPDATE_INTERVAL_MS + DATA_STALE_TIME_MS;
            const statusNowOlder = utc - this.watchdripData.getStatus().now > XDRIP_UPDATE_INTERVAL_MS + DATA_STALE_TIME_MS;
            if (bgTimeOlder || statusNowOlder) {
                logger.log("data older than sensor update interval, update again");
                this.fetchNewData = true;
            }
        } else {
            if (this.lastInfoUpdate === 0 && this.lastUpdateAttempt === 0) {
                logger.log("initial fetch");
                this.fetchNewData = true;
            } else {
                if (utc - this.lastUpdateAttempt > DATA_STALE_TIME_MS) {
                    logger.log("side app not responding, force update again");
                    this.renewMB = true;
                    this.fetchNewData = true;
                }
            }    
        }

        if(this.fetchNewData){
            logger.log("CHECK_UPDATES_FETCH");
            this.fetchInfo();
        }
    }

    setUpdateValueWidgetCallback(callback){
        this.updateValueWidgetCallback = callback;
    }

    setUpdateTimesWidgetCallback(callback){
        this.updateTimesWidgetCallback = callback;
    }

    setOnUpdateStartCallback(callback){
        this.onUpdateStartCallback = callback;
    }

    setOnUpdateFinishCallback(callback){
        this.onUpdateFinishCallback = callback;
    }

    updateWidgets() {
        logger.log("updateWidgets");
        this.updateValuesWidget();
        if (!this.isAOD()) {
            this.updateTimesWidget();
        }
    }

    updateValuesWidget() {
        if (typeof this.updateValueWidgetCallback === "function"){
            logger.log("updateValuesWidget");
            this.updateValueWidgetCallback(this.watchdripData);
        }
    }

    updateTimesWidget() {
        if (typeof this.updateTimesWidgetCallback === "function"){
            logger.log("updateTimesWidget");
            this.updateTimesWidgetCallback(this.watchdripData);
        }
    }

    drawGraph() {
    }

    //connect watch with side app
    initConnection() {
        if (this.connectionActive){
            return;
        }
        logger.log("initConnection");
        this.connectionActive = true;
        this.messageBuilder.connect();
    }

    dropConnection(){
        if (this.connectionActive) {
            logger.log("dropConnection");
            this.messageBuilder.disConnect();
            this.updatingData = false;
            this.connectionActive = false;
        }
    }

    fetchInfo() {
        logger.log("fetchInfo");
        
        this.lastUpdateAttempt = this.timeSensor.utc;
        this.lastUpdateSuccessful = false;

        if (!hmBle.connectStatus()) {
            logger.log("No BT connection");
            return;
        }

        if (this.renewMB) {
            //we need to recreate connection to force start side app
            logger.log("renew messageBuilder");
            const appId = WATCHDRIP_APP_ID;
            this.messageBuilder = new MessageBuilder({ appId });
            getApp()._options.globalData.messageBuilder = this.messageBuilder;
            this.connectionActive = false;
            this.renewMB = false;
        }

        this.initConnection();
        logger.log("BT connection ok");

        this.updatingData = true;
        if (typeof this.onUpdateStartCallback === "function"){
            this.onUpdateStartCallback();
        }

        this.messageBuilder.request({
            method: Commands.getInfo,
        }, {
            timeout: 5000
        }).then((data) => {
            logger.log("received data");
            const {result: info = {}} = data;
            logger.log(info);
            try {
                if (info.error) {
                    logger.log("app-side error: " + info.message);
                    return;
                }
                const dataInfo = str2json(info);
                this.watchdripData.setData(dataInfo);
                this.watchdripData.updateTimeDiff();

                this.lastInfoUpdate = this.timeSensor.utc,
                this.lastUpdateSuccessful = true;

                this.saveInfo(info);
            } catch (e) {
                logger.log("parsing error: " + e);
            }
        }).catch((error) => {
            logger.log("fetch error: " + error);
            this.renewMB = true;
            this.saveInfo();
        }).finally(() => {
            this.updateWidgets();
            if (typeof this.onUpdateFinishCallback === "function"){
                this.onUpdateFinishCallback(this.lastUpdateSuccessful);
            }
            
            this.dropConnection();
        });
    }

    readInfo() {
        const info = hmFS.SysProGetChars(WF_INFO);
        if (info) {
            try {
                const data = str2json(info);

                this.watchdripData.setData(data);

                this.lastInfoUpdate = hmFS.SysProGetInt64(WF_INFO_LAST_UPDATE);
                this.lastUpdateSuccessful = hmFS.SysProGetBool(WF_INFO_LAST_UPDATE_SUCCESSFUL);

                logger.log("readInfo: success");
            } catch (e) {
                logger.log("error getting data from persistent storage: " + e);
            }
        }
    }

    saveInfo(info = "{}") {
        hmFS.SysProSetChars(WF_INFO, info);
        hmFS.SysProSetInt64(WF_INFO_LAST_UPDATE, this.timeSensor.utc);
        hmFS.SysProSetBool(WF_INFO_LAST_UPDATE_SUCCESSFUL, this.lastUpdateSuccessful);
    }

    destroy() {
        this.stopTimerDataUpdates();
        this.dropConnection();
    }
}