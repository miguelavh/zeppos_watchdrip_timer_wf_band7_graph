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

// const objects are "bindings". updating the const object properties updates the original object properties and vice-versa
const { messageBuilder } = getApp()._options.globalData;
const { watchDrip } = getApp()._options.globalData;


export const logger = Logger.getLogger("wf-wathchdrip");

let  debug;

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
        if (watchDrip.isAOD()) {
            logger.log("IS_AOD_TRUE");
            watchDrip.startTimerDataUpdates();
            
        }
        else {
            logger.log("IS_AOD_FALSE");
            hmUI.createWidget(hmUI.widget.WIDGET_DELEGATE, {
                resume_call: watchDrip.widgetDelegateCallbackResumeCall,
                pause_call: watchDrip.widgetDelegateCallbackPauseCall,
            });
        }
    }

    startTimerDataUpdates() {
        if (watchDrip.intervalTimer !== null) return; //already started
        
        const interval = watchDrip.isAOD() ? DATA_AOD_TIMER_UPDATE_INTERVAL_MS : DATA_TIMER_UPDATE_INTERVAL_MS;

        logger.log("startTimerDataUpdates, interval: " + interval);
        
        watchDrip.intervalTimer = watchDrip.globalNS.setInterval(() => {
            watchDrip.checkUpdates();
        }, interval);
    }

    stopTimerDataUpdates() {
        if (watchDrip.intervalTimer !== null) {
            logger.log("stopTimerDataUpdates");
            watchDrip.globalNS.clearInterval(watchDrip.intervalTimer);
            watchDrip.intervalTimer = null;
        }
    }

    isAOD(){
        return watchDrip.screenType === hmSetting.screen_type.AOD;
    }

    checkUpdates() {
        let fetchNewData = false;

        logger.log("CHECK_UPDATES");

        watchDrip.updateWidgets();
        
        if (watchDrip.updatingData) {
            return;
        }

        const utc = watchDrip.timeSensor.utc;
        if (watchDrip.lastInfoUpdate === 0) {
            if (watchDrip.lastUpdateAttempt === null) {
                logger.log("initial fetch");
                fetchNewData = true;
            }
        } else {
            if (watchDrip.lastUpdateSucessful) {
                if (utc - watchDrip.watchdripData.getBg().time > XDRIP_UPDATE_INTERVAL_MS) {
                    logger.log("data older than sensor update interval, update again");
                    fetchNewData = true;
                }
            } else {
                if ((utc - watchDrip.lastUpdateAttempt > DATA_STALE_TIME_MS)) {
                    logger.log("side app not responding, force update again");
                    //we need to recreate connection to force start side app
                    const appId = WATCHDRIP_APP_ID;
                    getApp()._options.globalData.messageBuilder = new MessageBuilder({ appId });
                    watchDrip.connectionActive = false;
                    fetchNewData = true;
                }
            }
        }

        if(fetchNewData){
            logger.log("CHECK_UPDATES_FETCH");
            watchDrip.fetchInfo();
        }
    }

    //connect watch with side app
    initConnection() {
        if (watchDrip.connectionActive){
            return;
        }
        logger.log("initConnection");
        watchDrip.connectionActive = true;
        messageBuilder.connect();
    }

    dropConnection(){
        if (watchDrip.connectionActive) {
            logger.log("dropConnection");
            messageBuilder.disConnect();
            watchDrip.connectionActive = false;
        }
    }

    setUpdateValueWidgetCallback(callback){
        watchDrip.updateValueWidgetCallback = callback;
    }

    setUpdateTimesWidgetCallback(callback){
        watchDrip.updateTimesWidgetCallback = callback;
    }

    setOnUpdateStartCallback(callback){
        watchDrip.onUpdateStartCallback = callback;
    }

    setOnUpdateFinishCallback(callback){
        watchDrip.onUpdateFinishCallback = callback;
    }

    updateWidgets() {
        logger.log("updateWidgets");
        watchDrip.updateValuesWidget();
        watchDrip.updateTimesWidget();
    }

    updateValuesWidget() {
        if (typeof watchDrip.updateValueWidgetCallback === "function"){
            logger.log("updateValuesWidget");
            watchDrip.updateValueWidgetCallback(watchDrip.watchdripData);
        }
    }

    updateTimesWidget() {
        if (typeof watchDrip.updateTimesWidgetCallback === "function"){
            logger.log("updateTimesWidget");
            watchDrip.updateTimesWidgetCallback(watchDrip.watchdripData);
        }
    }

    drawGraph() {
    }

    fetchInfo() {
        watchDrip.lastUpdateAttempt = watchDrip.timeSensor.utc;
        watchDrip.lastUpdateSucessful = false;

        watchDrip.initConnection();

        logger.log("fetchInfo");
        if (messageBuilder.connectStatus() === false) {
            logger.log("No bt connection");
            return;
        }
        logger.log("bt connection ok");
        watchDrip.updatingData = true;
        if (typeof watchDrip.onUpdateStartCallback === "function"){
            watchDrip.onUpdateStartCallback();
        }

        messageBuilder.request({
            method: Commands.getInfo,
        }, {
            timeout: 10000
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

                watchDrip.watchdripData.setData(dataInfo);
                watchDrip.watchdripData.updateTimeDiff();

                watchDrip.lastInfoUpdate = watchDrip.timeSensor.utc,
                watchDrip.lastUpdateSucessful = true;
            } catch (e) {
                logger.log("parsing error:" + e);
            }
        }).catch((error) => {
            logger.log("fetch error:" + error);
        }).finally(() => {
            watchDrip.updateWidgets();
            watchDrip.updatingData = false;
            if (typeof watchDrip.onUpdateFinishCallback === "function"){
                watchDrip.onUpdateFinishCallback(watchDrip.lastUpdateSucessful);
            }
            if (watchDrip.isAOD()){
                watchDrip.dropConnection();
            }
        });
    }

    // REMINDER: Callbacks need watchdrip instead of this, this is not working.
    /*Callback which is called  when watchface is active  (visible)*/
    widgetDelegateCallbackResumeCall() {
        logger.log("resume_call");
        watchDrip.updatingData = false;
        watchDrip.checkUpdates();
        logger.log("resume_callend");
    }

    /*Callback which is called  when watchface deactivating (not visible)*/
    widgetDelegateCallbackPauseCall() {
        logger.log("pause_call");
        watchDrip.updatingData = false;
        if (typeof watchDrip.onUpdateFinishCallback === "function"){
            watchDrip.onUpdateFinishCallback(watchDrip.lastUpdateSucessful);
        }
        watchDrip.dropConnection();
    }

    destroy() {
        watchDrip.stopTimerDataUpdates();
        watchDrip.dropConnection();
    }
}