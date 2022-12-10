import {Response} from "express";

export enum httpStatus {
    OK_200 = 200,
    CREATED_201 = 201,
    NO_CONTENT_204 = 204,
    BAD_REQUEST_400 = 400,
    NOT_FOUND_404 = 404,
    UNATHORIZED = 401,
}



type errorMessage = {
    message: string,
    field: string
}
export type ErrorType = {
    errorsMessages: errorMessage[]
}