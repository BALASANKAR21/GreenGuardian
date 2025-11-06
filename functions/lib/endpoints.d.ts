import * as functions from 'firebase-functions/v2';
export declare const endpoints: {
    getUserProfile: functions.https.HttpsFunction;
    updateUserProfile: functions.https.HttpsFunction;
    searchPlants: functions.https.HttpsFunction;
    getUserGarden: functions.https.HttpsFunction;
    addPlantToGarden: functions.https.HttpsFunction;
    updatePlantInGarden: functions.https.HttpsFunction;
    addEnvironmentalData: functions.https.HttpsFunction;
    getEnvironmentalData: functions.https.HttpsFunction;
};
