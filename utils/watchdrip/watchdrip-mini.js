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

    //call before any usage of the class instance
    prepare(){
        watchdrip = this.globalNS.watchdrip;
    }

    start() {
        //Monitor watchface activity in order to recreate connection
        if (getGlobalWD().isAOD()) {
            logger.log("IS_AOD_TRUE");
            getGlobalWD().startTimerDataUpdates();
            
        }
        else {
            logger.log("IS_AOD_FALSE");
            hmUI.createWidget(hmUI.widget.WIDGET_DELEGATE, {
                resume_call: getGlobalWD().widgetDelegateCallbackResumeCall,
                pause_call: getGlobalWD().widgetDelegateCallbackPauseCall,
            });
        }
    }

    startTimerDataUpdates() {
        if (getGlobalWD().intervalTimer !== null) return; //already started
        
        const interval = getGlobalWD().isAOD() ? DATA_AOD_TIMER_UPDATE_INTERVAL_MS : DATA_TIMER_UPDATE_INTERVAL_MS;

        logger.log("startTimerDataUpdates, interval: " + interval);
        
        getApp()._options.globalData.watchDrip.intervalTimer = getGlobalWD().globalNS.setInterval(() => {
            getGlobalWD().checkUpdates();
        }, interval);
    }

    stopTimerDataUpdates() {
        if (getGlobalWD().intervalTimer !== null) {
            logger.log("stopTimerDataUpdates");
            getGlobalWD().globalNS.clearInterval(getGlobalWD().intervalTimer);
            getApp()._options.globalData.watchDrip.intervalTimer = null;
        }
    }

    isAOD(){
        return getGlobalWD().screenType === hmSetting.screen_type.AOD;
    }

    checkUpdates() {
        let fetchNewData = false;

        logger.log("CHECK_UPDATES");

        getGlobalWD().updateWidgets();
        
        if (getGlobalWD().updatingData) {
            return;
        }

        const utc = getGlobalWD().timeSensor.utc;

        if (getGlobalWD().lastInfoUpdate === 0) {
                logger.log("initial fetch");
                fetchNewData = true;
        } else {
            if (getGlobalWD().lastUpdateSucessful) {
                if (utc - getGlobalWD().watchdripData.getBg().time > XDRIP_UPDATE_INTERVAL_MS + DATA_STALE_TIME_MS) {
                    logger.log("data older than sensor update interval, update again");
                    fetchNewData = true;
                }
            } else {
                if ((utc - getGlobalWD().lastUpdateAttempt > DATA_STALE_TIME_MS)) {
                    logger.log("side app not responding, force update again");
                    //we need to recreate connection to force start side app
                    const appId = WATCHDRIP_APP_ID;
                    getApp()._options.globalData.messageBuilder = new MessageBuilder({ appId });
                    getGlobalWD().connectionActive = false;
                    fetchNewData = true;
                }
            }
        }

        if(fetchNewData){
            logger.log("CHECK_UPDATES_FETCH");
            getGlobalWD().fetchInfo();
        }
    }

    //connect watch with side app
    initConnection() {
        if (getGlobalWD().connectionActive){
            return;
        }
        logger.log("initConnection");
        getApp()._options.globalData.watchDrip.connectionActive = true;
        getGlobalMB().connect();
    }

    dropConnection(){
        if (getGlobalWD().connectionActive) {
            logger.log("dropConnection");
            getGlobalMB().disConnect();
            getApp()._options.globalData.watchDrip.connectionActive = false;
        }
    }

    setUpdateValueWidgetCallback(callback){
        getApp()._options.globalData.watchDrip.updateValueWidgetCallback = callback;
    }

    setUpdateTimesWidgetCallback(callback){
        getApp()._options.globalData.watchDrip.updateTimesWidgetCallback = callback;
    }

    setOnUpdateStartCallback(callback){
        getApp()._options.globalData.watchDrip.onUpdateStartCallback = callback;
    }

    setOnUpdateFinishCallback(callback){
        getApp()._options.globalData.watchDrip.onUpdateFinishCallback = callback;
    }

    updateWidgets() {
        logger.log("updateWidgets");
        getGlobalWD().updateValuesWidget();
        getGlobalWD().updateTimesWidget();
    }

    updateValuesWidget() {
        if (typeof getGlobalWD().updateValueWidgetCallback === "function"){
            logger.log("updateValuesWidget");
            getGlobalWD().updateValueWidgetCallback(getGlobalWD().watchdripData);
        }
    }

    updateTimesWidget() {
        if (typeof getGlobalWD().updateTimesWidgetCallback === "function"){
            logger.log("updateTimesWidget");
            getGlobalWD().updateTimesWidgetCallback(getGlobalWD().watchdripData);
        }
    }

    drawGraph() {
    }

    fetchInfo() {
        getApp()._options.globalData.watchDrip.lastUpdateAttempt = getGlobalWD().timeSensor.utc;
        getApp()._options.globalData.watchDrip.lastUpdateSucessful = false;

        getGlobalWD().initConnection();

        logger.log("fetchInfo");
        if (getGlobalMB().connectStatus() === false) {
            logger.log("No BT connection");
            return;
        }
        logger.log("BT connection ok");
        getApp()._options.globalData.watchDrip.updatingData = true;
        if (typeof getGlobalWD().onUpdateStartCallback === "function"){
            getGlobalWD().onUpdateStartCallback();
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
                    logger.log("app-side error:" + info.message);
                    return;
                }
                const dataInfo = str2json(info);

                getGlobalWD().watchdripData.setData(dataInfo);
                getGlobalWD().watchdripData.updateTimeDiff();

                getApp()._options.globalData.watchDrip.lastInfoUpdate = getGlobalWD().timeSensor.utc,
                getApp()._options.globalData.watchDrip.lastUpdateSucessful = true;
            } catch (e) {
                logger.log("parsing error:" + e);
            }
        }).catch((error) => {
            logger.log("fetch error:" + error);
        }).finally(() => {
            getGlobalWD().updateWidgets();
            getApp()._options.globalData.watchDrip.updatingData = false;
            if (typeof getGlobalWD().onUpdateFinishCallback === "function"){
                getGlobalWD().onUpdateFinishCallback(getGlobalWD().lastUpdateSucessful);
            }
            if (getGlobalWD().isAOD()){
                getGlobalWD().dropConnection();
            }
        });
    }

    // REMINDER: Callbacks need watchdrip instead of this, this is not working.
    /*Callback which is called  when watchface is active  (visible)*/
    widgetDelegateCallbackResumeCall() {
        logger.log("resume_call");
        getApp()._options.globalData.watchDrip.updatingData = false;
        getGlobalWD().checkUpdates();
        logger.log("resume_callend");
    }

    /*Callback which is called  when watchface deactivating (not visible)*/
    widgetDelegateCallbackPauseCall() {
        logger.log("pause_call");
        getApp()._options.globalData.watchDrip.updatingData = false;
        if (typeof getGlobalWD().onUpdateFinishCallback === "function"){
            getGlobalWD().onUpdateFinishCallback(getGlobalWD().lastUpdateSucessful);
        }
        getGlobalWD().dropConnection();
    }

    destroy() {
        getGlobalWD().stopTimerDataUpdates();
        getGlobalWD().dropConnection();
    }
}