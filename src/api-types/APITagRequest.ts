import { APITagType } from './APITagType';
import { APITagSortOrder } from './APITagSortOrder';

export type APITagRequest = {
    type: APITagType,
    search: {
        letter: string,
        page: number,
        sort: APITagSortOrder,
        text: string,
        uses: number
    }
}