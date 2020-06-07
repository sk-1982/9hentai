import { APIBook } from './api-types/APIBook';

export class NineHentaiBook {
    public page_count: number;
    public views: number;
    public favorites: number;
    public downloads: number;
    public title: string;
    public alt_title: string;
    public id: number;
    public tags: APIBook['tags'];
    
    public cover: string;
    public cover_small: string;
    public thumbnails: string[] = [];
    public pages: string[] = [];

    constructor(book: APIBook) {
        this.page_count = book.total_page;
        this.views = book.total_view;
        this.favorites = book.total_favorite;
        this.downloads = book.total_download;
        this.title = book.title;
        this.alt_title = book.alt_title;
        this.id = book.id;
        this.tags = book.tags;

        const cdn = book.image_server;

        this.cover = `${cdn}${book.id}/cover.jpg`;
        this.cover_small = `${cdn}${book.id}/cover-small.jpg`;

        for (let page_number = 1; page_number <= book.total_page; ++page_number) {
            this.thumbnails.push(`${cdn}${book.id}/preview/${page_number}t.jpg`);
            this.pages.push(`${cdn}${book.id}/${page_number}.jpg`);
        }
    }
}
