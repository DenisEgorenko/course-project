import {resolutions} from "../index";

export type UpdateVideoInputModel = {
    title: string
    author: string
    availableResolutions?: Array<resolutions>
    canBeDownloaded?: boolean
    minAgeRestriction?: number
    publicationDate?: string
}