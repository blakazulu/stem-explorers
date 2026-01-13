export class ServiceError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = "ServiceError";
  }
}

export function handleFirebaseError(error: unknown, operation: string): never {
  console.error(`Firebase ${operation} error:`, error);

  if (error instanceof Error) {
    if (error.message.includes("permission")) {
      throw new ServiceError("אין הרשאה לביצוע פעולה זו", "PERMISSION_DENIED");
    }
    if (error.message.includes("network")) {
      throw new ServiceError("שגיאת רשת, נסה שוב", "NETWORK_ERROR");
    }
  }

  throw new ServiceError("שגיאה בטעינת נתונים", "UNKNOWN_ERROR");
}
