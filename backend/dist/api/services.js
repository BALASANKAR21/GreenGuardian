// Import the actual service implementations here
import { services as serviceImplementations } from '../services';
export const services = {
    users: serviceImplementations.users,
    plants: serviceImplementations.plants,
    gardens: serviceImplementations.gardens,
    environmentalData: serviceImplementations.environmentalData
};
