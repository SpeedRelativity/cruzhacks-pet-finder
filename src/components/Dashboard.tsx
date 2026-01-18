'use client';

import { useState } from 'react';
import { Search, Upload, MapPin, CheckCircle2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const heroImageSrc = '/images/hero.jpg';

export function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');

  const userReports = [
    {
      id: 1,
      name: 'Luna',
      type: 'Golden Retriever',
      status: 'missing' as const,
      location: 'Brooklyn, NY',
      date: 'Dec 15, 2024',
      image: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400&h=400&fit=crop',
      tags: ['Golden', 'Large', 'Red Collar'],
    },
    {
      id: 2,
      name: 'Max',
      type: 'Beagle',
      status: 'missing' as const,
      location: 'Queens, NY',
      date: 'Dec 13, 2024',
      image: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400&h=400&fit=crop',
      tags: ['Tricolor', 'Medium', 'Blue Tag'],
    },
    {
      id: 3,
      name: 'Charlie',
      type: 'Golden Retriever',
      status: 'missing' as const,
      location: 'Manhattan, NY',
      date: 'Dec 10, 2024',
      image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop',
      tags: ['Golden', 'Large', 'Friendly'],
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      
      {/* 1. HERO SECTION: Split Layout */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          
          <div className="relative z-10 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              24 New matches found today
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
                <Upload className="w-5 h-5" /> Report Lost Pet
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
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Success</p>
                    <p className="text-lg font-bold text-slate-800">Cooper reunited</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SEARCH: Integrated Experience */}
      <section className="relative -mt-16 z-20 px-6 pb-24">
        <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur p-4 rounded-[2.5rem] shadow-lg border border-white/50">
          <div className="flex flex-col md:flex-row items-center gap-2">
            <div className="flex-1 flex items-center px-6 w-full">
              <Search className="w-6 h-6 text-blue-400 mr-4" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by breed, color, or location..."
                className="w-full bg-transparent border-none focus:ring-0 text-lg py-4 placeholder:text-slate-400"
              />
            </div>
            <button className="w-full md:w-auto px-10 py-4 bg-slate-900 text-white rounded-[1.8rem] font-bold hover:bg-blue-600 transition-all shadow-lg">
              Analyze Area
            </button>
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
              View Map <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {userReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </div>
      </div>
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
