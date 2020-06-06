import { APIResult } from './APIResult';
import { APITag } from './APITag';

export type APITagResult = APIResult<APITag[], {
    total_count: number
}>;
