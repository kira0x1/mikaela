export interface IRedditRequest {
    kind: string
    data: {
        modhash: string
        dist: number
        children: Array<IRedditChild>
        after: string | undefined
        before: string | undefined
    }
}

export interface IRedditChild {
    kind: string
    data: IReddit
}

export interface IReddit {
    title: string
    url: string
    subreddit: string
    ups: number
    downs: number
    over_18: boolean
}
