"use client";

import { useState, useEffect } from "react";
import { SwipeCard } from "./SwipeCard";
import { MOCK_PETS, Pet } from "@/lib/mockData";
import { AnimatePresence } from "framer-motion";

export const SwipeDeck = () => {
    const [pets, setPets] = useState<Pet[]>([]);
    const [lastDirection, setLastDirection] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPets = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/reports');
                const data = await response.json();

                // Map backend data to frontend Pet interface
                const mappedPets: Pet[] = data.map((report: any) => ({
                    id: report._id,
                    name: report.pet_name,
                    species: report.tags.species,
                    breed: report.tags.breed,
                    age: report.tags.age_group,
                    image_url: report.image_urls?.[0] || 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80',
                    report_type: report.report_type,
                    tags: [...(report.tags.marks || []), report.tags.primary_color],
                    distance_miles: Math.floor(Math.random() * 10) + 1 // Mock distance for now
                }));

                setPets(mappedPets);
            } catch (error) {
                console.error("Failed to fetch pets:", error);
                setPets(MOCK_PETS); // Fallback to mock data on error
            } finally {
                setLoading(false);
            }
        };

        fetchPets();
    }, []);

    const handleSwipe = (id: string, direction: "left" | "right") => {
        setLastDirection(direction);
        setPets((current) => current.filter((p) => p.id !== id));
        console.log(`Swiped ${direction} on pet ${id}`);

        if (direction === "right") {
            // Trigger match logic later
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[600px] text-center text-white p-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <h2 className="text-xl">Finding pets nearby...</h2>
            </div>
        );
    }

    if (pets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[600px] text-center text-white p-6">
                <h2 className="text-2xl font-bold">No more pets nearby!</h2>
                <p className="text-gray-400 mt-2">Check back later or expand your search area.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-6 px-6 py-3 bg-blue-600 rounded-full font-bold hover:bg-blue-700 transition"
                >
                    Refresh
                </button>
            </div>
        );
    }

    return (
        <div className="relative flex items-center justify-center w-full h-[700px]">
            <div className="relative w-full max-w-sm h-[600px]">
                <AnimatePresence>
                    {pets.map((pet, index) => (
                        <SwipeCard
                            key={pet.id}
                            pet={pet}
                            index={index}
                            onSwipe={handleSwipe}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};
