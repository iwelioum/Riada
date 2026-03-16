import { RiadaEnvironment } from './environment.model';

export const environment: RiadaEnvironment = {
  production: false,
  apiUrl: 'https://localhost:7001/api',
  requestTimeoutMs: 15000,
  optionalApiEndpoints: {
    exercises: null,
    trainers: null,
    workouts: null,
    mealPlan: null
  }
};
