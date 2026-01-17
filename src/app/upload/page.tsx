import Link from 'next/link';
import { ArrowLeft, UploadCloud } from 'lucide-react';

export default function UploadPage() {
    return (
        <main className="flex min-h-screen flex-col items-center bg-black text-white p-4">
            <header className="w-full max-w-lg flex items-center justify-between py-6">
                <Link href="/" className="p-2 hover:bg-gray-800 rounded-full transition">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-xl font-bold">Report Lost Pet</h1>
                <div className="w-10" />
            </header>

            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg text-center">
                <div className="p-12 border-2 border-dashed border-gray-700 rounded-3xl bg-gray-900/50 hover:bg-gray-900/80 transition cursor-pointer group">
                    <UploadCloud size={64} className="mx-auto text-gray-500 group-hover:text-blue-500 transition mb-4" />
                    <h3 className="text-xl font-bold mb-2">Upload Photo</h3>
                    <p className="text-gray-400">Drag & drop or click to upload</p>
                </div>

                <p className="mt-8 text-sm text-gray-500 max-w-xs">
                    Our AI will analyze the photo to automatically detect breed, color, and unique markings.
                </p>
            </div>

        </main>
    );
}
