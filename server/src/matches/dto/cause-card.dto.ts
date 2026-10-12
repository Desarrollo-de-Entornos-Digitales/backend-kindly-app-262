export interface OrganizationCardSnippet {
    id: number;
    name: string;
    verification_status: string;
    is_verified: boolean;
}

export interface CategoryCardSnippet {
    id: number;
    name: string;
}

export interface LocationCardSnippet {
    address: string;
    latitude: string;
    longitude: string;
}

export interface CauseCardDto {
    id: number;
    title: string;
    description: string;
    cover_image_url: string;
    organization: OrganizationCardSnippet;
    category: CategoryCardSnippet;
    start_date: Date;
    end_date: Date;
    location: LocationCardSnippet;
    capacity: number | null;
    spots_available: number | null;
    occupied_spots: number;
    is_full: boolean;
}
