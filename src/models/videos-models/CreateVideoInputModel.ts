import {resolutions} from './resolutionsModel';

export type createVideoInputModel = {
    title: string,
    author: string,
    availableResolutions: Array<resolutions>
}