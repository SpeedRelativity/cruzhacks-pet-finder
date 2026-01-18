'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UploadCloud, Loader, X, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useRef } from 'react';

type UploadStatus = 'idle' | 'uploading' | 'analyzing' | 'saving' | 'complete';

export default function UploadPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
    const [progressMessage, setProgressMessage] = useState('');
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');
    const [reportType, setReportType] = useState<'Lost' | 'Found'>('Lost');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
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
        setUploadStatus('uploading');
        setProgressMessage('Preparing images...');

        try {
            // Step 1: Prepare form data
            setProgressMessage('Preparing upload...');
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

            // Step 2: Upload to S3
            setUploadStatus('uploading');
            setProgressMessage(`Uploading ${selectedFiles.length} image(s) to cloud storage...`);

            const response = await fetch('http://localhost:8000/api/reports', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: response.statusText }));
                throw new Error(errorData.detail || `Upload failed: ${response.statusText}`);
            }

            // Step 3: AI Analysis
            setUploadStatus('analyzing');
            setProgressMessage('Analyzing pet with AI...');

            // Step 4: Saving to database
            setUploadStatus('saving');
            setProgressMessage('Saving report to database...');

            const data = await response.json();
            
            // Check if matches were created - wait a bit for backend to process
            let hasMatches = false;
            if (data.report_id) {
                try {
                    // Small delay to ensure backend has processed the match
                    await new Promise(resolve => setTimeout(resolve, 500));
                    const matchResponse = await fetch(`http://localhost:8000/api/matches?status=pending&limit=50`);
                    if (matchResponse.ok) {
                        const matchData = await matchResponse.json();
                        if (matchData.status === 'success' && matchData.matches && matchData.matches.length > 0) {
                            // Check if any match involves this report
                            hasMatches = matchData.matches.some((m: any) => 
                                m.lost_report?.report_id === data.report_id || 
                                m.found_report?.report_id === data.report_id
                            );
                        }
                    }
                } catch (err) {
                    console.error('Error checking for matches:', err);
                    // Don't fail the upload if match check fails
                }
            }
            
            setUploadStatus('complete');
            setProgressMessage('Report created successfully!');
            setResult({ ...data, hasMatches });
            console.log('Upload successful:', data);
            
            // Store hasMatches for popup display
            setResult({ ...data, hasMatches });
            
            // Show match popup if matches found - navigation handled by button click
        } catch (err: any) {
            setError(err.message || 'Upload failed');
            setUploadStatus('idle');
            setProgressMessage('');
            console.error('Upload error:', err);
        } finally {
            setLoading(false);
            setTimeout(() => {
                if (uploadStatus !== 'complete') {
                    setUploadStatus('idle');
                    setProgressMessage('');
                }
            }, 1000);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center bg-background text-foreground p-4 pt-24">
            <header className="w-full max-w-2xl flex items-center justify-between py-6 mb-4">
                <Link href="/" className="p-2 hover:bg-card rounded-full transition">
                    <ArrowLeft size={24} className="text-foreground" />
                </Link>
                <h1 className="text-2xl font-bold text-foreground">Report {reportType} Pet</h1>
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
                                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                                        reportType === type
                                            ? 'bg-primary text-primary-foreground shadow-primary'
                                            : 'bg-card text-muted-foreground hover:bg-primary/10 hover:text-foreground border border-border'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        {/* Image Upload Area */}
                        <div
                            onClick={() => !loading && fileInputRef.current?.click()}
                            onDragOver={(e) => !loading && e.preventDefault()}
                            onDrop={(e) => !loading && handleDragDrop(e)}
                            className={`p-12 border-2 border-dashed rounded-3xl bg-card backdrop-blur-xl border-border transition w-full shadow-lg ${
                                loading 
                                    ? 'border-primary cursor-wait' 
                                    : 'hover:bg-primary/5 hover:border-primary/50 cursor-pointer group'
                            }`}
                        >
                            {loading ? (
                                <>
                                    <Loader size={64} className="mx-auto text-primary animate-spin mb-4" />
                                    <h3 className="text-xl font-bold mb-2 text-primary">
                                        {uploadStatus === 'uploading' && 'Uploading Images...'}
                                        {uploadStatus === 'analyzing' && 'Analyzing with AI...'}
                                        {uploadStatus === 'saving' && 'Saving Report...'}
                                        {uploadStatus === 'complete' && 'Complete!'}
                                    </h3>
                                    <p className="text-muted-foreground">{progressMessage}</p>
                                </>
                            ) : (
                                <>
                                    <UploadCloud size={64} className="mx-auto text-muted group-hover:text-primary transition mb-4" />
                                    <h3 className="text-xl font-bold mb-2 text-foreground">Upload Photos</h3>
                                    <p className="text-muted-foreground">Drag & drop or click to upload multiple images</p>
                                    <p className="text-sm text-muted mt-2">Multiple images will create a carousel</p>
                                </>
                            )}
                        </div>

                        {/* Selected Files Display */}
                        {selectedFiles.length > 0 && (
                            <div className="w-full">
                                <p className="text-sm text-muted-foreground mb-2">{selectedFiles.length} image(s) selected</p>
                                <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto">
                                    {selectedFiles.map((file, idx) => (
                                        <div key={idx} className="relative rounded-xl overflow-hidden border border-border shadow-sm">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Preview ${idx}`}
                                                className="w-full h-24 object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeFile(idx)}
                                                className="absolute top-1 right-1 bg-destructive hover:bg-destructive/90 text-white p-1 rounded-full shadow-lg"
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
                        <div className="w-full bg-card backdrop-blur-xl p-6 rounded-2xl border border-border shadow-lg space-y-4">
                            <h3 className="text-lg font-bold text-foreground mb-4">Pet Details</h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Pet Name"
                                    value={petName}
                                    onChange={(e) => setPetName(e.target.value)}
                                    className="px-4 py-2.5 bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                                    required
                                />
                                <select
                                    value={petType}
                                    onChange={(e) => setPetType(e.target.value)}
                                    className="px-4 py-2.5 bg-input-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
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
                        <div className="w-full bg-card backdrop-blur-xl p-6 rounded-2xl border border-border shadow-lg space-y-4">
                            <h3 className="text-lg font-bold text-foreground mb-4">Your Information</h3>
                            
                            <input
                                type="text"
                                placeholder="Your Name"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                                required
                            />
                            
                            <input
                                type="email"
                                placeholder="Email"
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)}
                                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                                required
                            />
                            
                            <input
                                type="tel"
                                placeholder="Phone"
                                value={userPhone}
                                onChange={(e) => setUserPhone(e.target.value)}
                                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                                required
                            />
                            
                            <input
                                type="text"
                                placeholder="Location (City/Address)"
                                value={userLocation}
                                onChange={(e) => setUserLocation(e.target.value)}
                                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                                required
                            />
                            
                            <textarea
                                placeholder="Additional Details (optional)"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none"
                                rows={3}
                            />
                        </div>

                        {error && (
                            <div className="w-full p-4 bg-destructive/10 border border-destructive rounded-xl text-destructive-foreground">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || selectedFiles.length === 0}
                            className="w-full px-6 py-4 bg-primary text-primary-foreground rounded-2xl font-semibold hover:opacity-90 transition-opacity shadow-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Uploading...' : 'Submit Report'}
                        </button>
                    </form>
                ) : (
                    /* Results Display */
                    <div className="w-full space-y-6">
                        {/* Match Found Popup */}
                        {result.hasMatches && (
                            <div className="fixed inset-0 bg-dark-overlay backdrop-blur-sm z-50 flex items-center justify-center p-6">
                                <div className="bg-card backdrop-blur-xl rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl animate-fade-in border-2 border-accent">
                                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-5xl animate-bounce shadow-lg">
                                        🎉
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-bold text-foreground mb-2">We Have Found a Match!</h3>
                                        <p className="text-lg text-muted-foreground">A perfect match (3/3 tags) has been found for your pet!</p>
                                    </div>
                                    <div className="bg-accent-light rounded-xl p-4 border border-accent/30">
                                        <p className="text-sm text-accent font-medium">
                                            Click below to review and accept the match!
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            router.push('/?page=swipe');
                                            // Close popup by clearing hasMatches
                                            setResult((prev: any) => ({ ...prev, hasMatches: false }));
                                        }}
                                        className="w-full px-6 py-4 bg-gradient-to-r from-accent to-primary text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg"
                                    >
                                        View Match Now →
                                    </button>
                                    <button
                                        onClick={() => {
                                            setResult((prev: any) => ({ ...prev, hasMatches: false }));
                                        }}
                                        className="w-full px-6 py-3 bg-background/50 text-foreground rounded-xl font-semibold hover:bg-background border border-border transition-opacity"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        <div className="p-6 bg-card backdrop-blur-xl rounded-2xl border-2 border-accent/30 shadow-lg">
                            <div className="flex items-center gap-3 mb-6">
                                <CheckCircle2 size={32} className="text-accent" />
                                <h2 className="text-2xl font-bold text-accent">Report Submitted Successfully!</h2>
                            </div>

                            <div className="space-y-6">
                                {/* Image Carousel */}
                                {result.image_urls && result.image_urls.length > 0 && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-3 font-medium">
                                            Uploaded Images ({result.image_count || result.image_urls.length})
                                        </p>
                                        <div className="relative bg-card rounded-xl overflow-hidden border border-border shadow-lg">
                                            <div className="relative h-64 md:h-96 bg-background">
                                                <img
                                                    src={result.image_urls[currentImageIndex]}
                                                    alt={`Pet image ${currentImageIndex + 1}`}
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = '/images/hero.jpg';
                                                    }}
                                                />
                                                
                                                {/* Navigation arrows */}
                                                {result.image_urls.length > 1 && (
                                                    <>
                                                        <button
                                                            onClick={() => setCurrentImageIndex((prev) => 
                                                                prev === 0 ? result.image_urls.length - 1 : prev - 1
                                                            )}
                                                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background text-foreground p-2 rounded-full transition shadow-lg"
                                                        >
                                                            <ChevronLeft size={24} />
                                                        </button>
                                                        <button
                                                            onClick={() => setCurrentImageIndex((prev) => 
                                                                (prev + 1) % result.image_urls.length
                                                            )}
                                                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background text-foreground p-2 rounded-full transition shadow-lg"
                                                        >
                                                            <ChevronRight size={24} />
                                                        </button>
                                                    </>
                                                )}
                                                
                                                {/* Image counter */}
                                                {result.image_urls.length > 1 && (
                                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm text-foreground px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                                                        {currentImageIndex + 1} / {result.image_urls.length}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Thumbnail strip */}
                                            {result.image_urls.length > 1 && (
                                                <div className="flex gap-2 p-4 overflow-x-auto bg-background/50">
                                                    {result.image_urls.map((url: string, idx: number) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => setCurrentImageIndex(idx)}
                                                            className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition shadow-sm ${
                                                                currentImageIndex === idx 
                                                                    ? 'border-primary ring-2 ring-primary/50' 
                                                                    : 'border-border hover:border-primary/50'
                                                            }`}
                                                        >
                                                            <img
                                                                src={url}
                                                                alt={`Thumbnail ${idx + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Pet Details */}
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2 font-semibold">Pet Details</p>
                                    <div className="bg-background/50 p-4 rounded-xl border border-border space-y-2">
                                        <p className="text-lg">
                                            <span className="font-bold text-foreground">{result.pet_details?.name || 'Unnamed'}</span>
                                            <span className="text-muted-foreground ml-2">({result.pet_details?.type})</span>
                                        </p>
                                        <p className="text-muted-foreground">{result.pet_details?.location}</p>
                                    </div>
                                </div>

                                {/* AI-Generated Tags */}
                                {result.detected_pet && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-2 font-semibold">AI-Generated Tags</p>
                                        <div className="bg-background/50 p-4 rounded-xl border border-border">
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                <div>
                                                    <span className="text-muted-foreground text-xs">Species:</span>
                                                    <p className="text-foreground font-medium">{result.detected_pet.species || 'Unknown'}</p>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground text-xs">Breed:</span>
                                                    <p className="text-foreground font-medium">{result.detected_pet.breed || 'Unknown'}</p>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground text-xs">Color:</span>
                                                    <p className="text-foreground font-medium">{result.detected_pet.primary_color || 'Unknown'}</p>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground text-xs">Age:</span>
                                                    <p className="text-foreground font-medium">{result.detected_pet.age_group || 'Unknown'}</p>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground text-xs">Size:</span>
                                                    <p className="text-foreground font-medium">{result.detected_pet.size || 'Unknown'}</p>
                                                </div>
                                                {result.detected_pet.marks && result.detected_pet.marks.length > 0 && (
                                                    <div className="col-span-2 md:col-span-3">
                                                        <span className="text-muted-foreground text-xs">Distinguishing Marks:</span>
                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                            {result.detected_pet.marks.map((mark: string, idx: number) => (
                                                                <span key={idx} className="bg-primary/20 text-primary px-3 py-1 rounded-lg text-xs font-medium">
                                                                    {mark}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Report ID */}
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2 font-semibold">Report ID</p>
                                    <div className="bg-background/50 p-3 rounded-xl border border-border">
                                        <p className="text-accent text-sm break-all font-mono">{result.report_id}</p>
                                        <p className="text-xs text-muted-foreground mt-1">Save this ID to track your report</p>
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
                                setPetType('Dog');
                                setUserName('');
                                setUserEmail('');
                                setUserPhone('');
                                setUserLocation('');
                                setDescription('');
                                setCurrentImageIndex(0);
                                setUploadStatus('idle');
                                setProgressMessage('');
                            }}
                            className="w-full px-6 py-4 bg-secondary text-secondary-foreground rounded-2xl font-semibold hover:opacity-90 transition-opacity shadow-lg"
                        >
                            Submit Another Report
                        </button>
                    </div>
                )}
            </div>

        </main>
    );
}
