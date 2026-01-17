"use client";

import { useState } from "react";
import { SwipeCard } from "./SwipeCard";
import { MOCK_PETS, Pet } from "@/lib/mockData";
import { AnimatePresence } from "framer-motion";

export const SwipeDeck = () => {
    const [pets, setPets] = useState<Pet[]>(MOCK_PETS);
    const [lastDirection, setLastDirection] = useState<string | null>(null);

    const handleSwipe = (id: string, direction: "left" | "right") => {
        setLastDirection(direction);
        // Remove the swiped pet from the stack
        setPets((current) => current.filter((p) => p.id !== id));
        console.log(`Swiped ${direction} on pet ${id}`);

        // In a real app, this is where we'd call the API
        if (direction === "right") {
            // Trigger match logic
        }
    };

    if (pets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[600px] text-center text-white p-6">
                <h2 className="text-2xl font-bold">No more pets nearby!</h2>
                <p className="text-gray-400 mt-2">Check back later or expand your search area.</p>
                <button
                    onClick={() => setPets(MOCK_PETS)}
                    className="mt-6 px-6 py-3 bg-blue-600 rounded-full font-bold hover:bg-blue-700 transition"
                >
                    Reset Deck
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
