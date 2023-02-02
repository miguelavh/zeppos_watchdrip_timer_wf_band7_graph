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

let watchdrip, debug;

/** 
 * @returns {Watchdrip}
 */
function getGlobalWatchDrip() {
    return getApp()._options.globalData.watchDrip;
}

/**
 * @param {Watchdrip} updateObj 
 */
function setGlobalWatchDrip(updateObj) {
    Object.assign(getApp()._options.globalData.watchDrip, updateObj);
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
        if (getGlobalWatchDrip().isAOD()) {
            logger.log("IS_AOD_TRUE");
            getGlobalWatchDrip().startTimerDataUpdates();
            
        }
        else {
            logger.log("IS_AOD_FALSE");
            hmUI.createWidget(hmUI.widget.WIDGET_DELEGATE, {
                resume_call: getGlobalWatchDrip().widgetDelegateCallbackResumeCall,
                pause_call: getGlobalWatchDrip().widgetDelegateCallbackPauseCall,
            });
        }
    }

    startTimerDataUpdates() {
        if (getGlobalWatchDrip().intervalTimer !== null) return; //already started
        
        const interval = getGlobalWatchDrip().isAOD() ? DATA_AOD_TIMER_UPDATE_INTERVAL_MS : DATA_TIMER_UPDATE_INTERVAL_MS;

        logger.log("startTimerDataUpdates, interval: " + interval);
        
        setGlobalWatchDrip({ intervalTimer: getGlobalWatchDrip().globalNS.setInterval(() => {
            getGlobalWatchDrip().checkUpdates();
        }, interval) });
    }

    stopTimerDataUpdates() {
        if (getGlobalWatchDrip().intervalTimer !== null) {
            logger.log("stopTimerDataUpdates");
            getGlobalWatchDrip().globalNS.clearInterval(getGlobalWatchDrip().intervalTimer);
            setGlobalWatchDrip({ intervalTimer: null });
        }
    }

    isAOD(){
        return getGlobalWatchDrip().screenType === hmSetting.screen_type.AOD;
    }

    checkUpdates() {
        let fetchNewData = false;

        logger.log("CHECK_UPDATES");

        getGlobalWatchDrip().updateWidgets();
        
        if (getGlobalWatchDrip().updatingData) {
            return;
        }

        const utc = getGlobalWatchDrip().timeSensor.utc;
        if (getGlobalWatchDrip().lastInfoUpdate === 0) {
            if (getGlobalWatchDrip().lastUpdateAttempt === null) {
                logger.log("initial fetch");
                fetchNewData = true;
            }
        } else {
            if (getGlobalWatchDrip().lastUpdateSucessful) {
                if (utc - getGlobalWatchDrip().watchdripData.getBg().time > XDRIP_UPDATE_INTERVAL_MS) {
                    logger.log("data older than sensor update interval, update again");
                    fetchNewData = true;
                }
            } else {
                if ((utc - getGlobalWatchDrip().lastUpdateAttempt > DATA_STALE_TIME_MS)) {
                    logger.log("side app not responding, force update again");
                    fetchNewData = true;
                }
            }
        }

        if(fetchNewData){
            logger.log("CHECK_UPDATES_FETCH");
            getGlobalWatchDrip().fetchInfo();
        }
    }

    //connect watch with side app
    initConnection() {
        if (getGlobalWatchDrip().connectionActive){
            return;
        }
        logger.log("initConnection");
        setGlobalWatchDrip({ connectionActive: true });
        const appId = WATCHDRIP_APP_ID;
        //we need to recreate connection to force start side app
        messageBuilder = new MessageBuilder({appId});
        messageBuilder.connect();
    }

    dropConnection(){
        if (getGlobalWatchDrip().connectionActive) {
            logger.log("dropConnection");
            messageBuilder.disConnect();
            setGlobalWatchDrip({ connectionActive: false });
        }
    }

    setUpdateValueWidgetCallback(callback){
        setGlobalWatchDrip({ updateValueWidgetCallback: callback });
    }

    setUpdateTimesWidgetCallback(callback){
        setGlobalWatchDrip({ updateTimesWidgetCallback: callback });
    }

    setOnUpdateStartCallback(callback){
        setGlobalWatchDrip({ onUpdateStartCallback: callback });
    }

    setOnUpdateFinishCallback(callback){
        setGlobalWatchDrip({ onUpdateFinishCallback: callback });
    }

    updateWidgets() {
        logger.log("updateWidgets");
        getGlobalWatchDrip().updateValuesWidget();
        getGlobalWatchDrip().updateTimesWidget();
    }

    updateValuesWidget() {
        if (typeof getGlobalWatchDrip().updateValueWidgetCallback === "function"){
            logger.log("updateValuesWidget");
            getGlobalWatchDrip().updateValueWidgetCallback(getGlobalWatchDrip().watchdripData);
        }
    }

    updateTimesWidget() {
        if (typeof getGlobalWatchDrip().updateTimesWidgetCallback === "function"){
            logger.log("updateTimesWidget");
            getGlobalWatchDrip().updateTimesWidgetCallback(getGlobalWatchDrip().watchdripData);
        }
    }

    drawGraph() {
    }

    fetchInfo() {
        setGlobalWatchDrip({ 
            lastUpdateAttempt: getGlobalWatchDrip().timeSensor.utc,
            lastUpdateSucessful: false
        });

        getGlobalWatchDrip().initConnection();

        logger.log("fetchInfo");
        if (messageBuilder.connectStatus() === false) {
            logger.log("No bt connection");
            return;
        }
        logger.log("bt connection ok");
        setGlobalWatchDrip({ updatingData: true });
        if (typeof getGlobalWatchDrip().onUpdateStartCallback === "function"){
            getGlobalWatchDrip().onUpdateStartCallback();
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

                getGlobalWatchDrip().watchdripData.setData(dataInfo);
                getGlobalWatchDrip().watchdripData.updateTimeDiff();

                setGlobalWatchDrip({ 
                    lastInfoUpdate: getGlobalWatchDrip().timeSensor.utc,
                    lastUpdateSucessful: true
                });
            } catch (e) {
                logger.log("parsing error:" + e);
            }
        }).catch((error) => {
            logger.log("fetch error:" + error);
        }).finally(() => {
            getGlobalWatchDrip().updateWidgets();
            setGlobalWatchDrip({ updatingData: false });
            if (typeof getGlobalWatchDrip().onUpdateFinishCallback === "function"){
                getGlobalWatchDrip().onUpdateFinishCallback(getGlobalWatchDrip().lastUpdateSucessful);
            }
            if (getGlobalWatchDrip().isAOD()){
                getGlobalWatchDrip().dropConnection();
            }
        });
    }

    // REMINDER: Callbacks need watchdrip instead of this, this is not working.
    /*Callback which is called  when watchface is active  (visible)*/
    widgetDelegateCallbackResumeCall() {
        logger.log("resume_call");
        setGlobalWatchDrip({ updatingData: false });
        getGlobalWatchDrip().checkUpdates();
        logger.log("resume_callend");
    }

    /*Callback which is called  when watchface deactivating (not visible)*/
    widgetDelegateCallbackPauseCall() {
        logger.log("pause_call");
        setGlobalWatchDrip({ updatingData: false });
        if (typeof getGlobalWatchDrip().onUpdateFinishCallback === "function"){
            getGlobalWatchDrip().onUpdateFinishCallback(getGlobalWatchDrip().lastUpdateSucessful);
        }
        getGlobalWatchDrip().dropConnection();
    }

    destroy() {
        getGlobalWatchDrip().stopTimerDataUpdates();
        getGlobalWatchDrip().dropConnection();
    }
}