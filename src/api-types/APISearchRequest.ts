import { APISortOrder } from './APISortOrder';
import { APITagType } from './APITagType';
import { APITag } from './APITag';

export type APISearchRequest = {
    page: number,
    pages: {
        range: [number, number]
    },
    sort: APISortOrder,
    text: string,
    tag: {
        text?: string,
        type?: APITagType,
        tags?: [],
        items: {
            excluded: (
                Pick<APITag, 'id' | 'type'> & 
                { [key: string]: any }
            )[],
            included: (
                Pick<APITag, 'id' | 'type'> & 
                { [key: string]: any }
            )[]
        }
    }
}
