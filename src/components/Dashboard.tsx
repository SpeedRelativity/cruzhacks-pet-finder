'use client';

import { MapPin, CheckCircle2, Upload as UploadIcon, Heart, Sparkles } from 'lucide-react';
import Link from 'next/link';

const comms1image = '/images/coms1.jpg'
const comms2image = '/images/coms2.jpg'
const comms3image = '/images/coms3.jpg'

const article1image = '/images/article1.jpg'
const article2image = '/images/article2.jpg'
const article3image = '/images/article3.jpg'

const heroImageSrc = '/images/hero.jpg';

export function Dashboard() {
  const userReports = [
    {
      id: 1,
      name: 'Luna',
      type: 'Golden Retriever',
      status: 'missing' as const,
      location: 'San Ramon, CA',
      date: 'Jan 15, 2026',
      image: comms2image,
      tags: ['Golden', 'Large', 'Red Collar'],
    },
    {
      id: 2,
      name: 'Max',
      type: 'Beagle',
      status: 'missing' as const,
      location: 'Palo Alto, CA',
      date: 'Dec 13, 2024',
      image: comms1image,
      tags: ['Tricolor', 'Medium', 'Blue Tag'],
    },
    {
      id: 3,
      name: 'Melanie',
      type: 'Russian Ragdoll',
      status: 'missing' as const,
      location: 'Santa Cruz, CA',
      date: 'Dec 10, 2024',
      image: comms3image,
      tags: ['White', 'm', 'Friendly'],
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      
      {/* 1. HERO SECTION: Split Layout */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 garp-12 items-center">
          
          <div className="relative z-10 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              24 New Pets Found Today
            </div>
            
            <h1 className="text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-slate-900">
              Reconnect with your <br />
              <span className="text-amber-500 italic">best friend.</span>
            </h1>
            
            <p className="text-xl text-slate-600 max-w-lg leading-relaxed font-medium">
              We know how stressful it can be when a loving pet is lost. Our mission is to help. We use AI-driven visual recognition and social listening to bridge the gap between lost pets and their families.

            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/upload" className="px-8 py-4 bg-amber-500 text-white rounded-2xl font-bold hover:bg-amber-600 transition-colors shadow-lg flex items-center gap-2 scale-100 hover:scale-105 transition-transform">
                <UploadIcon className="w-5 h-5" /> Report Lost Pet
              </Link>
              <Link href="/gallery" className="px-8 py-4 rounded-2xl font-bold text-slate-700 border-2 border-slate-200 hover:bg-slate-50 transition-colors">
                Browse Current Sightings
              </Link>
            </div>
          </div>

          {/* Right Side: Interactive Image */}
          <div className="relative lg:h-[600px] flex items-center justify-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-100/50 rounded-full blur-3xl opacity-30"></div>
            
            <div className="relative w-full max-w-lg">
              <img 
                src={heroImageSrc} 
                className="rounded-[3rem] shadow-2xl object-cover h-[500px] w-full transform -rotate-2 hover:rotate-0 transition-transform duration-700" 
                alt="Emotional connection"
              />
              {/* Floating Success Card */}
              <div className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur p-6 rounded-3xl shadow-lg border border-white/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                    <CheckCircle2 className="text-amber-500 w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-800">Smarter matching for faster reunions.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS: Three Step Process */}
      <section className="relative z-20 px-6 py-24">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-slate-900">How does PawScout work?</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Three steps to help you stay on alert.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative bg-white rounded-3xl p-8 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow">
              <div className="absolute -top-6 left-8 w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-lg">1</div>
              <div className="pt-6 space-y-4">
                <div className="flex justify-center mb-6">
                  <UploadIcon className="w-12 h-12 text-amber-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 text-center">Report Your Pet</h3>
                <p className="text-slate-600 text-center leading-relaxed">
                  Upload a photo and details about your lost pet. Our AI automatically the image to identify key features and detect any possible matches.
                </p>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="relative bg-white rounded-3xl p-8 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow">
              <div className="absolute -top-6 left-8 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">2</div>
              <div className="pt-6 space-y-4">
                <div className="flex justify-center mb-6">
                  <Sparkles className="w-12 h-12 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 text-center"> Analysis & Matching</h3>
                <p className="text-slate-600 text-center leading-relaxed">
                  Our AI scans community reports to find potential matches in real-time.
                </p>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="relative bg-white rounded-3xl p-8 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow">
              <div className="absolute -top-6 left-8 w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">3</div>
              <div className="pt-6 space-y-4">
                <div className="flex justify-center mb-6">
                  <Heart className="w-12 h-12 text-teal-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 text-center">Matched?</h3>
                <p className="text-slate-600 text-center leading-relaxed">
                  We notify you of matches and help coordinate the reunion with your beloved pet.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. COMMUNITY SIGHTINGS */}
      <div className="max-w-7xl mx-auto px-6 py-24 space-y-12">
        <div className="space-y-10">
          <div className="flex items-end justify-between border-b border-slate-100 pb-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-slate-900">Community Sightings</h2>
              <p className="text-slate-500 font-medium">Real-time alerts from your neighborhood</p>
            </div>
            <Link href="/gallery" className="group flex items-center gap-2 font-bold text-blue-600 hover:text-blue-700">
              View All Pets
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {userReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </div>
      </div>

      {/* 4. ARTICLES SECTION */}
      <section className="bg-gradient-to-b from-white to-slate-50 py-24 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-slate-900">Pet Safety Tips & Stories</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Learn from success stories and expert advice</p>
          </div>
          
          <div className= "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {/* Article 1 */}
            <article className="bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-100 hover:shadow-xl transition-shadow group">
              <div className="h-60 overflow-hidden relative">
                <img src={article1image} alt="Pet preparation" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-slate-900">Prepare Before It Happens</h3>
                <p className="text-slate-600 leading-relaxed">Keep clear photos of your pet, microchip information, and medical records ready. Being prepared can save precious time.</p>
                <a href="https://www.google.com/maps/search/santa+cruz+animal+shelter" target="_blank" rel="noopener noreferrer" className="inline-block text-amber-600 font-semibold hover:text-amber-700 text-sm">
                  Santa Cruz Animal Shelter →
                </a>
              </div>
            </article>

            {/* Article 2 */}
            <article className="bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-100 hover:shadow-xl transition-shadow group">
              <div className="h-48 overflow-hidden relative">
                <img src={article2image} alt="Happy reunited dog" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-slate-900">Success Story: Max's Journey</h3>
                <p className="text-slate-600 leading-relaxed">A cat lost for 3 days was reunited with his family through social media. Read how it happened.</p>
                <a href="https://www.google.com/maps/search/santa+cruz+dog+rescue+adoption" target="_blank" rel="noopener noreferrer" className="inline-block text-blue-600 font-semibold hover:text-blue-700 text-sm">
                  Santa Cruz Animal Rescue →
                </a>
              </div>
            </article>

            {/* Article 3 */}
            <article className="bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-100 hover:shadow-xl transition-shadow group">
              <div className="h-48 overflow-hidden relative">
                <img src={article3image} alt="Community helping pets" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-slate-900">Community Help Matters</h3>
                <p className="text-slate-600 leading-relaxed">Neighbors helped find Luna by sharing her photo. Discover how you can help pets in your community.</p>
                <a href="https://www.google.com/maps/search/santa+cruz+cat+adoption" target="_blank" rel="noopener noreferrer" className="inline-block text-teal-600 font-semibold hover:text-teal-700 text-sm">
                  Santa Cruz Adoption Center →
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}

// Sub-component for cleaner organization
function ReportCard({ report }: { report: any }) {
  return (
    <div className="group relative bg-white rounded-[2rem] border border-slate-100 p-3 hover:shadow-xl hover:shadow-blue-100 transition-all duration-500 hover:border-blue-200">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.6rem]">
        <img src={report.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={report.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-4 left-4">
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
            report.status === 'missing' ? 'bg-rose-500 text-white' : 'bg-teal-500 text-white'
          }`}>
            {report.status}
          </span>
        </div>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-slate-800">{report.name}</h3>
          <span className="text-sm font-semibold text-slate-400">{report.date}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
          <MapPin className="w-4 h-4 text-blue-500" />
          {report.location}
        </div>
      </div>
    </div>
  );
}
