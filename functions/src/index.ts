import { setGlobalOptions } from "firebase-functions";
setGlobalOptions({ maxInstances: 10 });

// Export all cloud function handlers from their respective modules
export { onboardUser, getUserProfile } from './user';
export { recommendPlants } from './recommend';
export { identifyPlant } from './identify';
export { getWeather } from './envdata';
export { getGreenSpaces } from './map';
export { testDbConnection } from './testdb';
