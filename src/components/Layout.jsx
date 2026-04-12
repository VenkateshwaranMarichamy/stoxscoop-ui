import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, Plus, Newspaper } from 'lucide-react';
import { cn } from '../utils/cn';

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-50 text-slate-900">
      {/* Top Header */}
      <header className="flex h-14 shrink-0 items-center justify-between px-6 bg-slate-900 text-white shadow-md sticky top-0 z-30">
        <Link to="/dashboard" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <TrendingUp className="h-5 w-5 text-emerald-400 stroke-[2.5]" />
          <span className="text-xl font-bold tracking-tight">
            <span className="text-white">Stox</span>
            <span className="text-emerald-400">Scoop</span>
          </span>
        </Link>
        <div className="flex items-center space-x-6">
          {location.pathname !== '/dashboard' && location.pathname !== '/' && (
            <Link 
              to="/dashboard" 
              className={cn(
                "text-sm font-semibold transition-colors hover:text-white",
                location.pathname === '/dashboard' ? "text-white" : "text-slate-300"
              )}
            >
              Dashboard
            </Link>
          )}
          <Link
            to="/market-updates"
            className={cn(
              "text-sm font-semibold transition-colors hover:text-white flex items-center",
              location.pathname.startsWith('/market-updates') ? "text-white" : "text-slate-300"
            )}
          >
            <Newspaper className="h-4 w-4 mr-1.5" /> Market Updates
          </Link>
          {location.pathname !== '/batch/create' && (
            <Link 
              to="/batch/create" 
              className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-md font-semibold text-sm transition-colors flex items-center shadow-sm"
            >
              <Plus className="h-4 w-4 mr-1 stroke-[3]" /> Add Event
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:px-8">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-slate-200 bg-white text-center text-sm font-medium text-slate-500 w-full shrink-0">
         Contact us as MCVR trades.
      </footer>
    </div>
  );
}
