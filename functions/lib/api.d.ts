import * as functions from 'firebase-functions';
export declare class ValidationError extends Error {
    readonly details?: Record<string, string> | undefined;
    constructor(message: string, details?: Record<string, string> | undefined);
}
export declare const getUserProfileEndpoint: functions.https.HttpsFunction;
export declare const createUserProfileEndpoint: functions.https.HttpsFunction;
export declare const updateUserProfileEndpoint: functions.https.HttpsFunction;
export declare const addPlantEndpoint: functions.https.HttpsFunction;
export declare const getPlantEndpoint: functions.https.HttpsFunction;
export declare const searchPlantsEndpoint: functions.https.HttpsFunction;
export declare const getUserGardenEndpoint: functions.https.HttpsFunction;
export declare const addPlantToGardenEndpoint: functions.https.HttpsFunction;
export declare const updatePlantInGardenEndpoint: functions.https.HttpsFunction;
export declare const savePlantIdentificationEndpoint: functions.https.HttpsFunction;
export declare const saveEnvironmentalDataEndpoint: functions.https.HttpsFunction;
export declare const getLatestEnvironmentalDataEndpoint: functions.https.HttpsFunction;
export declare const getEnvironmentalDataHistoryEndpoint: functions.https.HttpsFunction;
