import {resolutions} from "../../index";

export type createVideoInputModel = {
    title: string,
    author: string,
    availableResolutions: Array<resolutions>
}