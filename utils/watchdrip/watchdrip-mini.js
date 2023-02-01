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

let {messageBuilder} = getApp()._options.globalData;

export const logger = Logger.getLogger("wf-wathchdrip");

let watchdrip, debug

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
        //watchdrip.checkConfigUpdate();
        //watchdrip.readInfo();
    }

    //call before any usage of the class instance
    prepare(){
        watchdrip = this.globalNS.watchdrip;
    }

    start() { 
        //watchdrip.checkUpdates();
        // watchdrip.updateValuesWidget();
        //Monitor watchface activity in order to recreate connection
        if (watchdrip.isAOD()) {
            //watchdrip.widgetDelegateCallbackResumeCall();
            logger.log("IS_AOD_TRUE");
            watchdrip.startTimerDataUpdates();
        }
        else {
            logger.log("IS_AOD_FALSE");
            hmUI.createWidget(hmUI.widget.WIDGET_DELEGATE, {
                resume_call: watchdrip.widgetDelegateCallbackResumeCall,
                pause_call: watchdrip.widgetDelegateCallbackPauseCall,
            });
        }
    }

    startTimerDataUpdates() {
        if (watchdrip.intervalTimer !== null) return; //already started
        
        const interval = watchdrip.isAOD() ? DATA_AOD_TIMER_UPDATE_INTERVAL_MS : DATA_TIMER_UPDATE_INTERVAL_MS;

        logger.log("startTimerDataUpdates, interval: " + interval);
        watchdrip.intervalTimer = watchdrip.globalNS.setInterval(() => {
            watchdrip.checkUpdates();
        }, interval);
    }

    stopTimerDataUpdates() {
        if (watchdrip.intervalTimer !== null) {
            logger.log("stopTimerDataUpdates");
            watchdrip.globalNS.clearInterval(watchdrip.intervalTimer);
            watchdrip.intervalTimer = null;
        }
    }

    isAOD(){
        return watchdrip.screenType === hmSetting.screen_type.AOD;
    }

    checkUpdates() {
        let fetchNewData = false;

        logger.log("CHECK_UPDATES");

        watchdrip.updateTimesWidget();
        
        if (watchdrip.updatingData) {
            return;
        }

        let utc = watchdrip.timeSensor.utc;
        if (watchdrip.lastInfoUpdate === 0) {
            if (watchdrip.lastUpdateAttempt === null) {
                logger.log("initial fetch");
                fetchNewData = true;
            }
        } else {
            if (!watchdrip.lastUpdateSucessful) {
                if (watchdrip.lastUpdateAttempt !== null){
                    if ((utc - watchdrip.lastUpdateAttempt > DATA_STALE_TIME_MS)) {
                        logger.log("side app not responding, force update again");
                        fetchNewData = true;
                    }
                }
            }

            //if (utc - watchdrip.lastInfoUpdate > DATA_UPDATE_INTERVAL_MS) {
            //    logger.log("data older than watch data update interval, update again");
            //    fetchNewData = true;
            //}

            if (utc - watchdrip.watchdripData.getBg().time > XDRIP_UPDATE_INTERVAL_MS) {
                logger.log("data older than sensor update interval, update again");
                fetchNewData = true;
            }
        }

        if(fetchNewData){
            logger.log("CHECK_UPDATES_FETCH");
            watchdrip.fetchInfo();
        }
    }

    //connect watch with side app
    initConnection() {
        if (watchdrip.connectionActive){
            return;
        }
        logger.log("initConnection");
        watchdrip.connectionActive = true;
        const appId = WATCHDRIP_APP_ID;
        //we need to recreate connection to force start side app
        messageBuilder = new MessageBuilder({appId});
        messageBuilder.connect();
    }

    dropConnection(){
        if (watchdrip.connectionActive) {
            logger.log("dropConnection");
            messageBuilder.disConnect();
            watchdrip.connectionActive = false;
        }
    }

    setUpdateValueWidgetCallback(callback){
        watchdrip.updateValueWidgetCallback = callback;
    }

    setUpdateTimesWidgetCallback(callback){
        watchdrip.updateTimesWidgetCallback = callback;
    }

    setOnUpdateStartCallback(callback){
        watchdrip.onUpdateStartCallback = callback;
    }

    setOnUpdateFinishCallback(callback){
        watchdrip.onUpdateFinishCallback = callback;
    }

    updateWidgets() {
        logger.log("updateWidgets");
        watchdrip.updateValuesWidget();
        watchdrip.updateTimesWidget();
    }

    updateValuesWidget() {
        if (typeof watchdrip.updateValueWidgetCallback === "function"){
            logger.log("updateValuesWidget");
            watchdrip.updateValueWidgetCallback(watchdrip.watchdripData);
        }
    }

    updateTimesWidget() {
        if (typeof watchdrip.updateTimesWidgetCallback === "function"){
            logger.log("updateTimesWidget");
            watchdrip.updateTimesWidgetCallback(watchdrip.watchdripData);
        }
    }

    drawGraph() {
    }

    fetchInfo() {
        watchdrip.lastUpdateAttempt = watchdrip.timeSensor.utc;
        watchdrip.lastUpdateSucessful = false;

        if (!watchdrip.connectionActive) {
            watchdrip.initConnection();
        }

        logger.log("fetchInfo");
        if (messageBuilder.connectStatus() === false) {
            logger.log("No bt connection");
            return;
        }
        logger.log("bt connection ok");
        watchdrip.updatingData = true;
        if (typeof watchdrip.onUpdateStartCallback === "function"){
            watchdrip.onUpdateStartCallback();
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

                watchdrip.watchdripData.setData(dataInfo);
                watchdrip.watchdripData.updateTimeDiff();

                watchdrip.lastInfoUpdate = watchdrip.timeSensor.utc;
                watchdrip.lastUpdateSucessful = true;
            } catch (e) {
                logger.log("parsing error:" + e);
            }
        }).catch((error) => {
            logger.log("fetch error:" + error);
        }).finally(() => {
            watchdrip.updateWidgets();
            watchdrip.updatingData = false;
            if (typeof watchdrip.onUpdateFinishCallback === "function"){
                watchdrip.onUpdateFinishCallback(watchdrip.lastUpdateSucessful);
            }
            if (watchdrip.isAOD()){
                watchdrip.dropConnection();
            }
        });
    }

    // REMINDER: Callbacks need watchdrip instead of this, this is not working.
    /*Callback which is called  when watchface is active  (visible)*/
    widgetDelegateCallbackResumeCall() {
        logger.log("resume_call");
        watchdrip.updatingData = false;
        watchdrip.checkUpdates();
        //watchdrip.startTimerDataUpdates();
        logger.log("resume_callend");
    }

    /*Callback which is called  when watchface deactivating (not visible)*/
    widgetDelegateCallbackPauseCall() {
        logger.log("pause_call");
        watchdrip.updatingData = false;
        if (typeof watchdrip.onUpdateFinishCallback === "function"){
            watchdrip.onUpdateFinishCallback(watchdrip.lastUpdateSucessful);
        }
        watchdrip.dropConnection();
    }

    destroy() {
        watchdrip.stopTimerDataUpdates();
        watchdrip.dropConnection();
    }
}