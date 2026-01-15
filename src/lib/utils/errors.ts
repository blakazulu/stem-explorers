export class ServiceError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = "ServiceError";
  }
}

interface FirebaseError extends Error {
  code?: string;
}

export function handleFirebaseError(error: unknown, operation: string): never {
  console.error(`Firebase ${operation} error:`, error);

  if (error && typeof error === "object") {
    const firebaseError = error as FirebaseError;

    // Use Firebase error codes for reliable detection
    if (firebaseError.code === "permission-denied" || firebaseError.code === "PERMISSION_DENIED") {
      throw new ServiceError("אין הרשאה לביצוע פעולה זו", "PERMISSION_DENIED");
    }
    if (firebaseError.code === "unavailable" || firebaseError.code === "network-request-failed") {
      throw new ServiceError("שגיאת רשת, נסה שוב", "NETWORK_ERROR");
    }
    if (firebaseError.code === "not-found") {
      throw new ServiceError("הפריט לא נמצא", "NOT_FOUND");
    }
    if (firebaseError.code === "already-exists") {
      throw new ServiceError("פריט כזה כבר קיים", "ALREADY_EXISTS");
    }
  }

  throw new ServiceError("שגיאה בטעינת נתונים", "UNKNOWN_ERROR");
}
