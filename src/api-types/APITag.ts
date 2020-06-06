import { APITagType } from './APITagType';

export type APITag = {
    description: string | null,
    id: number,
    name: string,
    type: APITagType,
    books_count: number
}