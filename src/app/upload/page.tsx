'use client';

import Link from 'next/link';
import { ArrowLeft, UploadCloud, Loader, X } from 'lucide-react';
import { useState, useRef } from 'react';

export default function UploadPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');
    const [reportType, setReportType] = useState('Lost');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    
    // Form fields
    const [petName, setPetName] = useState('');
    const [petType, setPetType] = useState('Dog');
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userPhone, setUserPhone] = useState('');
    const [userLocation, setUserLocation] = useState('');
    const [description, setDescription] = useState('');
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (files: FileList) => {
        const newFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
        if (newFiles.length === 0) {
            setError('Please select image files');
            return;
        }
        setSelectedFiles([...selectedFiles, ...newFiles]);
        setError('');
    };

    const removeFile = (index: number) => {
        setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    };

    const handleDragDrop = (e: React.DragEvent) => {
        e.preventDefault();
        handleFileSelect(e.dataTransfer.files);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.currentTarget.files) {
            handleFileSelect(e.currentTarget.files);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (selectedFiles.length === 0) {
            setError('Please upload at least one image');
            return;
        }
        if (!petName || !userName || !userEmail || !userPhone || !userLocation) {
            setError('Please fill in all required fields');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const formData = new FormData();
            
            // Add all files
            selectedFiles.forEach(file => {
                formData.append('files', file);
            });
            
            // Add form data
            formData.append('report_type', reportType);
            formData.append('pet_name', petName);
            formData.append('pet_type', petType);
            formData.append('user_name', userName);
            formData.append('user_email', userEmail);
            formData.append('user_phone', userPhone);
            formData.append('user_location', userLocation);
            formData.append('description', description);

            const response = await fetch('http://localhost:8000/api/reports', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            const data = await response.json();
            setResult(data);
            console.log('Upload successful:', data);
        } catch (err: any) {
            setError(err.message || 'Upload failed');
            console.error('Upload error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center bg-black text-white p-4">
            <header className="w-full max-w-2xl flex items-center justify-between py-6">
                <Link href="/" className="p-2 hover:bg-gray-800 rounded-full transition">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-xl font-bold">Report {reportType} Pet</h1>
                <div className="w-10" />
            </header>

            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl">
                {!result ? (
                    <form onSubmit={handleSubmit} className="w-full space-y-6">
                        {/* Report Type Selection */}
                        <div className="flex gap-4 mb-6">
                            {['Lost', 'Found'].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setReportType(type)}
                                    className={`px-6 py-2 rounded-lg font-semibold transition ${
                                        reportType === type
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        {/* Image Upload Area */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDragDrop}
                            className="p-12 border-2 border-dashed border-gray-700 rounded-3xl bg-gray-900/50 hover:bg-gray-900/80 transition cursor-pointer group w-full"
                        >
                            {loading ? (
                                <Loader size={64} className="mx-auto text-blue-500 animate-spin mb-4" />
                            ) : (
                                <UploadCloud size={64} className="mx-auto text-gray-500 group-hover:text-blue-500 transition mb-4" />
                            )}
                            <h3 className="text-xl font-bold mb-2">
                                {loading ? 'Processing...' : 'Upload Photos'}
                            </h3>
                            <p className="text-gray-400">
                                {loading ? 'Processing with AI...' : 'Drag & drop or click to upload multiple images'}
                            </p>
                        </div>

                        {/* Selected Files Display */}
                        {selectedFiles.length > 0 && (
                            <div className="w-full">
                                <p className="text-sm text-gray-400 mb-2">{selectedFiles.length} image(s) selected</p>
                                <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto">
                                    {selectedFiles.map((file, idx) => (
                                        <div key={idx} className="relative">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Preview ${idx}`}
                                                className="w-full h-24 object-cover rounded"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeFile(idx)}
                                                className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 p-1 rounded"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleInputChange}
                            className="hidden"
                        />

                        {/* Pet Details Form */}
                        <div className="w-full bg-gray-900/50 p-6 rounded-lg border border-gray-700 space-y-4">
                            <h3 className="text-lg font-bold mb-4">Pet Details</h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Pet Name"
                                    value={petName}
                                    onChange={(e) => setPetName(e.target.value)}
                                    className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500"
                                    required
                                />
                                <select
                                    value={petType}
                                    onChange={(e) => setPetType(e.target.value)}
                                    className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                                >
                                    <option>Dog</option>
                                    <option>Cat</option>
                                    <option>Bird</option>
                                    <option>Rabbit</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        </div>

                        {/* User Contact Form */}
                        <div className="w-full bg-gray-900/50 p-6 rounded-lg border border-gray-700 space-y-4">
                            <h3 className="text-lg font-bold mb-4">Your Information</h3>
                            
                            <input
                                type="text"
                                placeholder="Your Name"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500"
                                required
                            />
                            
                            <input
                                type="email"
                                placeholder="Email"
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500"
                                required
                            />
                            
                            <input
                                type="tel"
                                placeholder="Phone"
                                value={userPhone}
                                onChange={(e) => setUserPhone(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500"
                                required
                            />
                            
                            <input
                                type="text"
                                placeholder="Location (City/Address)"
                                value={userLocation}
                                onChange={(e) => setUserLocation(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500"
                                required
                            />
                            
                            <textarea
                                placeholder="Additional Details (optional)"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500"
                                rows={3}
                            />
                        </div>

                        {error && (
                            <div className="w-full p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-400">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || selectedFiles.length === 0}
                            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-semibold transition"
                        >
                            {loading ? 'Uploading...' : 'Submit Report'}
                        </button>
                    </form>
                ) : (
                    /* Results Display */
                    <div className="w-full space-y-6">
                        <div className="p-6 bg-gray-900/50 rounded-lg border border-gray-700">
                            <h2 className="text-xl font-bold mb-4 text-green-400">✅ Report Submitted!</h2>

                            <div className="space-y-4">
                                {/* Pet Details */}
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Pet Details:</p>
                                    <div className="bg-gray-800 p-3 rounded text-left">
                                        <p><strong>{result.pet_details.name}</strong> ({result.pet_details.type})</p>
                                        <p className="text-gray-400">{result.pet_details.location}</p>
                                    </div>
                                </div>

                                {/* AI Analysis */}
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">AI Analysis:</p>
                                    <div className="bg-gray-800 p-3 rounded text-left">
                                        <pre className="text-sm text-white whitespace-pre-wrap">
                                            {JSON.stringify(result.detected_pet, null, 2)}
                                        </pre>
                                    </div>
                                </div>

                                {/* Uploaded Images */}
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Uploaded Images:</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {result.image_urls.map((url: string, idx: number) => (
                                            <a
                                                key={idx}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-400 hover:text-blue-300 underline text-sm truncate"
                                            >
                                                Image {idx + 1}
                                            </a>
                                        ))}
                                    </div>
                                </div>

                                {/* Report ID */}
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Report ID:</p>
                                    <div className="bg-gray-800 p-3 rounded text-left">
                                        <p className="text-green-400 text-sm break-all">{result.report_id}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setResult(null);
                                setError('');
                                setSelectedFiles([]);
                                setPetName('');
                                setUserName('');
                                setUserEmail('');
                                setUserPhone('');
                                setUserLocation('');
                                setDescription('');
                            }}
                            className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
                        >
                            Submit Another Report
                        </button>
                    </div>
                )}
            </div>

        </main>
    );
}
