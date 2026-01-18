export interface BaseResponse<T = any> {
  status: number
  message: string
  data: T
}

export interface Picture {
  id: string
  index: number
  width: number
  height: number
  file_name: string
  thumbnail: string
  thumb_hash: string
  regular: string
}

export interface Artwork {
  id: string
  title: string
  description: string
  source_url: string
  r18: boolean
  like_count: number
  tags: string[]
  artist: {
    id: string
    name: string
    type: string
    username: string
    uid: string
  }
  source_type: string
  pictures: Picture[]
}

export interface ArtworkListResponse extends BaseResponse<Artwork[]> { }

export interface CountResponse extends BaseResponse<number> { }

export interface Artist {
  id: string
  name: string
  username: string
  type: string
  uid: number
}

export interface ArtistResponse extends BaseResponse<Artist> { }

export interface ArtworkDetailResponse extends BaseResponse<Artwork> { }

export interface Tag {
  name: string
}

export interface TagListResponse extends BaseResponse<Tag[]> { }

export interface ArtworkListRequest {
  page: number
  page_size: number
  artist_id?: string
}

export interface LikeStatusResponse extends BaseResponse<boolean> { }

export interface MyIPResponse {
  country: string
  countryName: string
  ip: string
}

export interface WaterfallItem {
  id: string
  detail: Artwork
}
