export type Pet = {
    id: string;
    name: string;
    species: string;
    breed: string;
    age: string;
    image_url: string;
    report_type: 'LOST' | 'FOUND';
    tags: string[];
    distance_miles: number;
};

export const MOCK_PETS: Pet[] = [
    {
        id: '1',
        name: 'Buddy',
        species: 'Dog',
        breed: 'Golden Retriever',
        age: 'Adult',
        image_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=600&auto=format&fit=crop',
        report_type: 'LOST',
        tags: ['Friendly', 'Red Collar', 'Chipped'],
        distance_miles: 0.5,
    },
    {
        id: '2',
        name: 'Mittens',
        species: 'Cat',
        breed: 'Tabby',
        age: 'Young',
        image_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=600&auto=format&fit=crop',
        report_type: 'FOUND',
        tags: ['No Collar', 'Hungry', 'Distinctive Markings'],
        distance_miles: 1.2,
    },
    {
        id: '3',
        name: 'Rocky',
        species: 'Dog',
        breed: 'German Shepherd',
        age: 'Senior',
        image_url: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?q=80&w=600&auto=format&fit=crop',
        report_type: 'LOST',
        tags: ['Limping', 'Blue Harness'],
        distance_miles: 2.5,
    },
];
