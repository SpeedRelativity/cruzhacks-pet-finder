import { SwipeDeck } from '@/components/SwipeDeck';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function SwipePage() {
    return (
        <main className="flex min-h-screen flex-col items-center bg-black text-white p-4">
            {/* Header */}
            <header className="w-full max-w-lg flex items-center justify-between py-6">
                <Link href="/" className="p-2 hover:bg-gray-800 rounded-full transition">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                    Find Your Buddy
                </h1>
                <div className="w-10" /> {/* Spacer for centering */}
            </header>

            {/* Deck */}
            <div className="flex-1 flex items-center justify-center w-full max-w-lg">
                <SwipeDeck />
            </div>

            {/* Footer Instructions */}
            <div className="mb-8 text-center text-gray-500 text-sm">
                <p>Swipe <span className="text-green-500 font-bold">RIGHT</span> if this is your pet</p>
                <p>Swipe <span className="text-red-500 font-bold">LEFT</span> to skip</p>
            </div>
        </main>
    );
}
