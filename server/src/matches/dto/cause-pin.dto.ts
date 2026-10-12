export interface CausePinCategorySnippet {
    id: number;
    name: string;
}

export interface CausePinDto {
    id: number;
    title: string;
    latitude: number;
    longitude: number;
    category?: CausePinCategorySnippet;
}
