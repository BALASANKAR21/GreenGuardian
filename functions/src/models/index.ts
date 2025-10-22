import { userProfileOperations } from './operations/user-profile';
import { plantOperations } from './operations/plants';
import { gardenOperations } from './operations/gardens';
import { plantIdentificationOperations } from './operations/plant-identification';
import { environmentalDataOperations } from './operations/environmental-data';

export const db = {
  users: userProfileOperations,
  plants: plantOperations,
  gardens: gardenOperations,
  identifications: plantIdentificationOperations,
  environmentalData: environmentalDataOperations
};