"use client";

import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { X, Heart, MapPin } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { Pet } from "@/lib/mockData";

interface SwipeCardProps {
    pet: Pet;
    onSwipe: (id: string, direction: "left" | "right") => void;
    index: number;
}

export const SwipeCard = ({ pet, onSwipe, index }: SwipeCardProps) => {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-30, 30]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
    const color = useTransform(x, [-200, 200], ["#ef4444", "#22c55e"]);

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (info.offset.x > 100) {
            onSwipe(pet.id, "right");
        } else if (info.offset.x < -100) {
            onSwipe(pet.id, "left");
        }
    };

    return (
        <motion.div
            style={{
                x,
                rotate,
                opacity,
                zIndex: index,
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            className="absolute top-0 w-full h-full max-w-sm cursor-grab active:cursor-grabbing"
            whileTap={{ scale: 1.05 }}
        >
            <div className="relative w-full h-[600px] bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-800">
                <div className="relative w-full h-3/4">
                    <Image
                        src={pet.image_url}
                        alt={pet.name}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-gray-900 to-transparent" />
                </div>

                <div className="absolute bottom-0 w-full p-6 text-white">
                    <h2 className="text-3xl font-bold flex items-end gap-2">
                        {pet.name}, <span className="text-xl font-normal text-gray-300">{pet.age}</span>
                    </h2>

                    <div className="flex items-center gap-2 mt-1 text-gray-300">
                        <MapPin size={18} />
                        <span className="text-sm">{pet.distance_miles} miles away</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                        {pet.tags.map((tag) => (
                            <span key={tag} className="px-3 py-1 text-xs font-semibold bg-gray-800 rounded-full border border-gray-700">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Swipe Indicators */}
                <motion.div className="absolute top-8 left-8 -rotate-12 border-4 border-green-500 rounded-lg p-2 opacity-0" style={{ opacity: useTransform(x, [50, 150], [0, 1]) }}>
                    <span className="text-4xl font-bold text-green-500 uppercase">Found!</span>
                </motion.div>

                <motion.div className="absolute top-8 right-8 rotate-12 border-4 border-red-500 rounded-lg p-2 opacity-0" style={{ opacity: useTransform(x, [-150, -50], [1, 0]) }}>
                    <span className="text-4xl font-bold text-red-500 uppercase">Skip</span>
                </motion.div>

            </div>
        </motion.div>
    );
};
