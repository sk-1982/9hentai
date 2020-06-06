import { APIResult } from './APIResult';
import { APIBook } from './APIBook';

export type APIBookResult = APIResult<Omit<APIBook, 'tags'>>;
