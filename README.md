# 9Hentai API
A NodeJS module written in TypeScript to access 9hentai's undocumented API.

# Usage
```js
const { NineAnimeAPI } = require('9anime');
const api = new NineAnimeAPI();

const search_results = await api.search('query');

if (search_results.status) console.log(search_results.results);
```

# Documentation

### `class NineHentaiAPI`: main API class

#### `static async get_all_tags(): Promise<APITag[]>`: gets a list of all cached tags

#### `constructor(options?)`
* `options` (optional):
    * `options.fetch_options`: options to pass to [`node-fetch`](https://github.com/node-fetch/node-fetch)
    * `options.timeout`: timeout, in ms, for fetch requests. Default: `25000`
    * `options.fetch_tags`: `boolean`, whether or not a list of all tags should be fetched. Required for auto-tagging. Tags are only fetched once per process. Note that due to the tag fetch, immediately searching after constructing an API object can be slower. Default: `true`
    * `tag_minimum_usage`: minimum numbers of uses for tags to be fetched. Default: `20`
#### `async get_tags(request: APITagRequest): Promise<APITagResult>`: gets a list of tags. 
* `request: APITagRequest`: see `APITagRequest` for parameters

#### `async get_book(id: number | string): Promise<NineHentaiBook | null>`: gets a book given it's id. Returns null if nto found
* `id: number|string`: book id

#### `async search(query: string, options?): Promise<NineHentaiSearch>`: searches for books given a query
* `query: string`: the query to search for
* `options`: search options
    * `options.auto_tag: boolean`: whether search queries should be converted to tags. For example, the query `neptunia futa` gets converted
    * `options.page: number`: the page to search on (zero-indexed). Default: `0`
    * `options.pages: { range: [number, number] }`: the allowed number of pages a book can be. This is an object with a property called `range` which has an array of two values, the lower bound and upper bound. Default: `{ range: [0, 2000] }`
    * `options.sort: APISortOrder`: the order the results should be sorted in. See `APISortOrder` for values. Default: `APISortOrder.NEWEST`
    * `options.text`: the text to search for. Default: `''`
    * `options.tag.items`: excluded/included tags
        * `options.tag.items.excluded`: array of excluded tags. Tags are objects with a numeric `id` and `type` property. Default: `[]`
        * `options.tag.items.included`: array of included tags. Tags are objects with a numeric `id` and `type` property. Default: `[]`
        * **note**: 9hentai's tag search is broken, and searching for more than one tag can cause results with completely different tags to be returned

#### `async search(options: Partial<APISearchRequest>): Promise<NineHentaiSearch>`: search for books given a search object
* `options`: search options. Options are same as above, except this method does not support auto-tagging

### `class NineHentaiSearch`: a search result returned by the API
* `status: boolean`: if this search was successful. In rare cases such as a 500 server error or invalid data passed, this can be `false`
* `pages: number`: number of pages returned from the search
* `results: NineHentaiBook[]`: array of books returned from the search

### `class NineHentaiBook`: a book result returned by the API
* `page_count: number`: number of pages the book has
* `views: number`: number of views the book has
* `favorites: number`: number of favorites the book has
* `downloads: number`: number of downloads the book has
* `title: string`: the main title for the book
* `alt_title: string`: the alternate title, usually in japanese
* `id: number`: the book gallery id
* `tags: APITag[]`: list of tags this book has
* `cover: string`: url of the book cover
* `cover_small: string`: url of the small book cover
* `thumbnails: string[]`: array of thumbnail urls of the book
* `pages: string[]`: array of page image urls of the book

## API Types

### `APIBook`
```ts
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
```

### `APISearchRequest`
```ts
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
```

### `APISortOrder`
```ts
export const enum APISortOrder {
    NEWEST = 0,
    POPULAR_CURRENTLY = 1,
    MOST_FAPPED = 2,
    MOST_VIEWED = 3,
    TITLE = 4   
}
```

### `APITag`
```ts
export type APITag = {
    description: string | null,
    id: number,
    name: string,
    type: APITagType,
    books_count: number
}
```

### `APITagType`
```ts
export enum APITagType {
    TAG = 1,
    GROUP = 2,
    PARODY = 3,
    ARTIST = 4,
    CHARACTER = 5
}
```

### `APITagRequest`
```ts
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
```

### `APITagSortOrder`
```ts
export const enum APITagSortOrder {
    NAME = 0,
    MOST_USES = 1,
    LEAST_USES = 2
}
```
