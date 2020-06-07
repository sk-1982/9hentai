import { APITag } from './APITag';

export type APIBook = {
    alt_title: string, // japanese title
    id: number,
    image_server: string,
    tags: (APITag & {
        pivot: {
            book_id: number,
            tag_id: number
        }
    })[],
    title: string,
    total_download: number,
    total_favorite: number,
    total_page: number,
    total_view: number
}