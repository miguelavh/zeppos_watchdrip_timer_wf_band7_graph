import {getGlobal} from "../../shared/global";

import {
    WATCHDRIP_APP_ID
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

const { messageBuilder } = getApp()._options.globalData;

export const logger = Logger.getLogger("wf-wathchdrip");

let  debug;

function getGlobalWD() {
    return getApp()._options.globalData.watchDrip;
}

function getGlobalMB() {
    return getApp()._options.globalData.messageBuilder;
}

export class Watchdrip {
    constructor() {
        this.screenType = hmSetting.getScreenType();

        this.updateIntervals = this.screenType === hmSetting.screen_type.AOD ? DATA_AOD_UPDATE_INTERVAL_MS : DATA_UPDATE_INTERVAL_MS;

        this.globalNS = getGlobal();
        debug = this.globalNS.debug;
        this.timeSensor = hmSensor.createSensor(hmSensor.id.TIME);
        this.watchdripData = new WatchdripData(this.timeSensor);

        this.lastInfoUpdate = 0;
        this.lastUpdateAttempt = null;
        this.lastUpdateSucessful = false;
        this.updatingData = false;

        this.intervalTimer = null;

        this.connectionActive = false;

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
        let fetchNewData = false;

        logger.log("CHECK_UPDATES");

        this.updateWidgets();
        
        if (this.updatingData) {
            return;
        }

        const utc = this.timeSensor.utc;

        if (this.lastInfoUpdate === 0) {
                logger.log("initial fetch");
                fetchNewData = true;
        } else {
            if (this.lastUpdateSucessful) {
                if (utc - this.watchdripData.getBg().time > XDRIP_UPDATE_INTERVAL_MS + DATA_STALE_TIME_MS) {
                    logger.log("data older than sensor update interval, update again");
                    fetchNewData = true;
                }
            } else {
                if ((utc - this.lastUpdateAttempt > DATA_STALE_TIME_MS)) {
                    logger.log("side app not responding, force update again");
                    //we need to recreate connection to force start side app
                    const appId = WATCHDRIP_APP_ID;
                    getApp()._options.globalData.messageBuilder = new MessageBuilder({ appId });
                    this.connectionActive = false;
                    fetchNewData = true;
                }
            }
        }

        if(fetchNewData){
            logger.log("CHECK_UPDATES_FETCH");
            this.fetchInfo();
        }
    }

    //connect watch with side app
    initConnection() {
        if (this.connectionActive){
            return;
        }
        logger.log("initConnection");
        this.connectionActive = true;
        getGlobalMB().connect();
    }

    dropConnection(){
        if (this.connectionActive) {
            logger.log("dropConnection");
            getGlobalMB().disConnect();
            this.updatingData = false;
            this.connectionActive = false;
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
        this.updateTimesWidget();
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

    fetchInfo() {
        this.lastUpdateAttempt = this.timeSensor.utc;
        this.lastUpdateSucessful = false;

        this.initConnection();

        logger.log("fetchInfo");
        if (getGlobalMB().connectStatus() === false) {
            logger.log("No BT connection");
            return;
        }
        logger.log("BT connection ok");
        this.updatingData = true;
        if (typeof this.onUpdateStartCallback === "function"){
            this.onUpdateStartCallback();
        }

        getGlobalMB().request({
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
                this.lastUpdateSucessful = true;
            } catch (e) {
                logger.log("parsing error: " + e);
            }
        }).catch((error) => {
            logger.log("fetch error: " + error);
        }).finally(() => {
            this.updateWidgets();
            this.updatingData = false;
            if (typeof this.onUpdateFinishCallback === "function"){
                this.onUpdateFinishCallback(this.lastUpdateSucessful);
            }
            if (this.isAOD()){
                this.dropConnection();
            }
        });
    }

    // REMINDER: Callbacks need global instance instead of this, "this" is not working.
    /*Callback which is called  when watchface is active  (visible)*/
    widgetDelegateCallbackResumeCall() {
        logger.log("resume_call");
        getGlobalWD().checkUpdates();
    }

    /*Callback which is called  when watchface deactivating (not visible)*/
    widgetDelegateCallbackPauseCall() {
        logger.log("pause_call");
        getGlobalWD().dropConnection();
    }

    destroy() {
        this.stopTimerDataUpdates();
        this.dropConnection();
    }
}