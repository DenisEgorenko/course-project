import {UsersService} from "../application/users-service";
import {RequestWithBody, RequestWithParams, RequestWithQuery} from "../../../types/requestTypes";
import {usersQueryModel} from "../domain/models/usersQueryModel";
import {Response} from "express";
import {
    userOutputModel,
    usersOutputModel,
    usersQueryRepositories
} from "../infrastructure/users-query-repositories";
import {ErrorType, httpStatus} from "../../../types/responseTypes";
import {CreateUserDTO} from "../domain/dto/CreateUserDTO";
import {usersURImodel} from "../domain/models/usersURImodel";
import {injectable} from "inversify";


@injectable()
export class UsersController {

    constructor(protected usersService: UsersService) {
    }

    async getAllUsers(req: RequestWithQuery<usersQueryModel>, res: Response<usersOutputModel>) {
        res.status(httpStatus.OK_200)
        res.json(await usersQueryRepositories.getAllUsers(req.query))
    }

    async createNewUser(req: RequestWithBody<CreateUserDTO>, res: Response<ErrorType | userOutputModel>) {
        try {
            const id = await this.usersService.createNewUser(req.body)
            const result = await usersQueryRepositories.getUserById(id)
            res.status(httpStatus.CREATED_201)
            res.json(result)
        } catch (e) {
            console.log(e)
            res.sendStatus(httpStatus.BAD_REQUEST_400)
        }
    }

    async deleteUser(req: RequestWithParams<usersURImodel>, res: Response) {

        if (!req.params.id) {
            res.sendStatus(httpStatus.BAD_REQUEST_400)
            return;
        }

        const deleteUser = await this.usersService.deleteUser(req.params.id)

        if (!deleteUser) {
            res.sendStatus(httpStatus.NOT_FOUND_404)
            return
        } else {
            res.sendStatus(httpStatus.NO_CONTENT_204)
            return;
        }

    }
}