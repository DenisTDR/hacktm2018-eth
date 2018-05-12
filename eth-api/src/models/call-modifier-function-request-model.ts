import {CallViewFunctionRequestModel} from './call-view-function-request-model';

export interface CallModifierFunctionRequestModel extends CallViewFunctionRequestModel {
    from: string;
    gas: number;
    value?: string;
}
