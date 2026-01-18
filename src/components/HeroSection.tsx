"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Search, PawPrint } from "lucide-react";

export const HeroSection = () => {
    return (
        <section className="relative flex flex-col items-center justify-center min-h-[90vh] px-4 text-center overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full bg-black z-[-1]" />
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-3xl"
            >
                <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-6">
                    Find Their Way Home.
                </h1>
                <p className="text-xl md:text-2xl text-gray-400 mb-12">
                    The AI-powered platform to reunite lost pets with their families instantly.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <Link href="/swipe" className="group relative px-8 py-4 bg-primary rounded-full font-bold text-primary-foreground shadow-lg hover:shadow-primary transition-all overflow-hidden">
                        <span className="relative flex items-center gap-2">
                            <Search size={20} />
                            I Found a Pet
                        </span>
                    </Link>

                    <Link href="/upload" className="group relative px-8 py-4 bg-transparent border-2 border-primary/50 text-foreground rounded-full font-bold hover:border-primary hover:bg-primary/5 transition-all">
                        <span className="flex items-center gap-2">
                            <PawPrint size={20} />
                            I Lost a Pet
                        </span>
                    </Link>

                    <Link href="/auth0-demo" className="group relative px-8 py-4 bg-secondary rounded-full font-bold text-white shadow-lg hover:opacity-90 transition-all">
                        <span className="flex items-center gap-2">
                            Sign In
                        </span>
                    </Link>
                </div>
            </motion.div>

            {/* Floating Elements Animation */}
            <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="absolute bottom-20 opacity-50 text-gray-500 text-sm"
            >
                Scroll to learn more
            </motion.div>
        </section>
    );
};
