export interface RiadaEnvironment {
  production: boolean;
  apiUrl: string;
  requestTimeoutMs: number;
  optionalApiEndpoints: {
    exercises: string | null;
    trainers: string | null;
    workouts: string | null;
    mealPlan: string | null;
  };
}
