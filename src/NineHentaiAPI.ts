import fetch, { RequestInit } from 'node-fetch';
import { APITagRequest } from './api-types/APITagRequest';
import { APITagResult } from './api-types/APITagResult';
import { APITagType } from './api-types/APITagType';
import { APITagSortOrder } from './api-types/APITagSortOrder';
import { APITag } from './api-types/APITag';
import { APISearchRequest } from './api-types/APISearchRequest';
import { APISearchResult } from './api-types/APISearchResult';
import { APIBook } from './api-types/APIBook';
import { NineHentaiBook } from './NineHentaiBook';
import { APIBookResult } from './api-types/APIBookResult';
import { APISortOrder } from './api-types/APISortOrder';
import extend from 'xtend';
import AbortController from 'abort-controller';
import { NineHentaiSearch } from './NineHentaiSearch';
import escape from 'escape-string-regexp';
import tag_aliases from './tag_aliases.json';

export type NineHentaiOptions = {
    fetch_options?: RequestInit,
    timeout?: number,
    fetch_tags?: boolean,
    tag_minimum_usage?: number
};

const sorted_tag_aliases = Object.entries(tag_aliases).sort(([a], [b]) => b.length - a.length);

const default_options = {
    fetch_options: {},
    timeout: 25000,
    fetch_tags: true,
    tag_minimum_usage: 20
};

const default_search_options: APISearchRequest = {
    page: 0,
    pages: { range: [0, 2000] },
    sort: APISortOrder.NEWEST,
    text: '',
    tag: {
        items: {
            excluded: [],
            included: []
        }
    }
};

export class NineHentaiAPI {
    private static tags: Promise<APITag[][]>[] = [];

    public static async get_all_tags(): Promise<APITag[]> {
        return (await Promise.all(NineHentaiAPI.tags)).flat(Infinity) as APITag[];
    }

    constructor(private options?: NineHentaiOptions) {
        this.options = extend(default_options, options);

        if (!this.options.fetch_tags || NineHentaiAPI.tags.length) return;

        Object.values(APITagType).filter(Number).forEach((tag_type: APITagType) => {
            NineHentaiAPI.tags.push(new Promise(async resolve => {
                const result = await this.get_tags({
                    type: tag_type,
                    search: {
                        letter: '',
                        page: 0,
                        sort: APITagSortOrder.MOST_USES,
                        text: '',
                        uses: this.options.tag_minimum_usage
                    }
                });

                if (!result.status || !result.total_count) return resolve();

                const tag_requests = [...new Array(result.total_count - 1).keys()].map(page => {
                    return this.get_tags({
                        type: tag_type,
                        search: {
                            letter: '',
                            page: page + 1,
                            sort: APITagSortOrder.MOST_USES,
                            text: '',
                            uses: this.options.tag_minimum_usage
                        }
                    }).then(result => result.status && result.results);
                });

                return resolve([result.results, ...(await Promise.all(tag_requests))]);
            }));
        });
    }

    private get_fetch_options(options: RequestInit): RequestInit {
        return Object.assign({},
            this.options.fetch_options,
            options,
            {
                headers: Object.assign({},
                    this.options.fetch_options?.headers ?? {},
                    options.headers ?? {}
                )
            }
        );
    }

    public async get_tags(request: APITagRequest): Promise<APITagResult> {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.options.timeout);

        const result = await fetch('https://9hentai.com/api/getTags', this.get_fetch_options({
            method: 'POST',
            body: JSON.stringify(request),
            headers: {
                'content-type': 'application/json;charset=UTF-8',
                'accept': 'application/json'
            },
            signal: controller.signal
        }));

        clearTimeout(timeout);

        return result.json();
    }

    public get_book(book: APIBook): NineHentaiBook
    public get_book(id: number | string): Promise<NineHentaiBook>
    public get_book(book_or_id: APIBook | number | string) {
        if (typeof book_or_id == 'number' || typeof book_or_id == 'string') {
            return this.fetch_book_details_by_id(book_or_id).then(api_book => {
                return api_book && new NineHentaiBook(api_book);
            });
        }

        return new NineHentaiBook(book_or_id);
    }

    private async fetch_book_details_by_id(id: number | string) {
        const book = await this.get_book_by_id(id);

        if (!book.status) return null;

        let page = 0;
        let total_pages = Infinity;

        while (page < total_pages) {
            const book_search = await this.api_search({
                page: page,
                pages: { range: [0, 2000] },
                sort: APISortOrder.NEWEST,
                text: book.results.title,
                tag: {
                    items: { excluded: [], included: [] }
                }
            });

            if (!book_search.status) break;

            total_pages = book_search.total_count;

            const book_details = book_search.results.find(book => book.id == id);

            if (book_details) return book_details;

            ++page;
        }

        return null;
    }

    private async get_book_by_id(id: number | string): Promise<APIBookResult> {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.options.timeout);

        const result = await fetch('https://9hentai.com/api/getBookByID', this.get_fetch_options({
            method: 'POST',
            body: `{"id":${id}}`,
            headers: {
                'content-type': 'application/json;charset=UTF-8',
                'accept': 'application/json'
            },
            signal: controller.signal
        }));

        clearTimeout(timeout);

        return result.json();
    }

    private async api_search(request: APISearchRequest): Promise<APISearchResult> {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.options.timeout);

        const result = await fetch('https://9hentai.com/api/getBook', this.get_fetch_options({
            method: 'POST',
            body: JSON.stringify({ search: request }),
            headers: {
                'content-type': 'application/json;charset=UTF-8',
                'accept': 'application/json'
            },
            signal: controller.signal
        }));

        clearTimeout(timeout);

        return result.json();
    }

    private get_tags_from_search(query: string, tags: APITag[]): [ string, Pick<APITag, 'id' | 'type'>[] ] {
        const output_tags = new Set<{ id: number, type: number }>();
        query = query.replace(/\s+/g, ' ');

        tags.sort((a, b) => b.name.length - a.name.length).forEach(tag => {
            const tag_regex = new RegExp(`\\b${escape(tag.name)}\\b`, 'ig');
            if (!tag_regex.test(query)) return;
            
            query = query.replace(tag_regex, '');
            output_tags.add(tag);
        });

        sorted_tag_aliases.forEach(([alias, [ type, id ]]) => {
            const tag_regex = new RegExp(`\\b${escape(alias)}\\b`, 'ig');
            if (!tag_regex.test(query)) return;

            query = query.replace(tag_regex, '');

            output_tags.add({
                id: id,
                type: type
            });
        });

        return [ query.replace(/\s+/g, ' '), [...output_tags] ];
    }

    public async search(query: string, options?: Partial<APISearchRequest> & { auto_tag?: boolean }): Promise<NineHentaiSearch>
    public async search(options: Partial<APISearchRequest>): Promise<NineHentaiSearch>
    public async search(query_or_options: string | Partial<APISearchRequest>, options?: Partial<APISearchRequest> & { auto_tag?: boolean }): Promise<NineHentaiSearch> {
        let search_options: APISearchRequest;
        
        if (typeof query_or_options == 'string') {
            search_options = extend(default_search_options, options ?? {});
            let query = query_or_options;

            if (options?.auto_tag ?? true) {
                const tags = (await Promise.all(NineHentaiAPI.tags)).flat(Infinity) as APITag[];
                let output_tags = [];
                [ query, output_tags ] = this.get_tags_from_search(query, tags);

                search_options.tag.items.included = output_tags;
            }

            search_options.text = query;
        } else {
            search_options = extend(default_search_options, query_or_options);
        }

        return new NineHentaiSearch(await this.api_search(search_options));
    }
}