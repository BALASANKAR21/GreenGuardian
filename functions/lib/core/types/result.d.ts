export type ServiceResult<T, E = Error> = ServiceSuccess<T> | ServiceError<E>;
export interface ServiceSuccess<T> {
    success: true;
    data: T;
}
export interface ServiceError<E> {
    success: false;
    error: E;
}
export declare function success<T>(data: T): ServiceSuccess<T>;
export declare function failure<E>(error: E): ServiceError<E>;
export type AsyncServiceResult<T, E = Error> = Promise<ServiceResult<T, E>>;
export declare function tryCatch<T>(promise: Promise<T>, errorTransformer?: (error: unknown) => Error): AsyncServiceResult<T>;
