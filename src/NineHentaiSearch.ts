import { APISearchResult } from './api-types/APISearchResult';
import { NineHentaiBook } from './NineHentaiBook';

export class NineHentaiSearch {
    public status: boolean;
    public pages: number | undefined;
    public results: NineHentaiBook[] | undefined;

    constructor(api_search: APISearchResult) {
        this.status = api_search.status;

        if (!api_search.status) return;

        this.pages = api_search.total_count;
        this.results = api_search.results.map(b => new NineHentaiBook(b));
    }
}