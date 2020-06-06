export type APIResult<Result, ExtraTypes = {}> = {
    status: false,
    message?: string
} | {
    status: true,
    results: Result
} & ExtraTypes;