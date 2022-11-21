import {resolutions} from './resolutionsModel';

export type UpdateVideoInputModel = {
    title: string
    author: string
    availableResolutions?: Array<resolutions>
    canBeDownloaded?: boolean
    minAgeRestriction?: number
    publicationDate?: string
}