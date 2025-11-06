export type ServiceResult<T, E = Error> = ServiceSuccess<T> | ServiceError<E>;

export interface ServiceSuccess<T> {
  success: true;
  data: T;
}

export interface ServiceError<E> {
  success: false;
  error: E;
}

export function success<T>(data: T): ServiceSuccess<T> {
  return { success: true, data };
}

export function failure<E>(error: E): ServiceError<E> {
  return { success: false, error };
}

export type AsyncServiceResult<T, E = Error> = Promise<ServiceResult<T, E>>;

export async function tryCatch<T>(
  promise: Promise<T>,
  errorTransformer: (error: unknown) => Error = (e) => e as Error
): AsyncServiceResult<T> {
  try {
    const data = await promise;
    return success(data);
  } catch (error) {
    return failure(errorTransformer(error));
  }
}