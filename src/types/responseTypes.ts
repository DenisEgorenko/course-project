import {Response} from "express";

export enum httpStatus {
    OK_200 = 200,
    CREATED_201 = 201,
    NO_CONTENT_204 = 204,
    BAD_REQUEST_400 = 400,
    NOT_FOUND_404 = 404,
    UNATHORIZED_401 = 401,
    FORBIDDEN_403 = 403,
    TOO_MANY_REQUESTS_429 = 429
}


type errorMessage = {
    message: string,
    field: string
}
export type ErrorType = {
    errorsMessages: errorMessage[]
}