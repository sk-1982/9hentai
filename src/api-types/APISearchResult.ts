import { APIResult } from './APIResult';
import { APIBook } from './APIBook';

export type APISearchResult = APIResult<APIBook[], {
    total_count: number
}>;
