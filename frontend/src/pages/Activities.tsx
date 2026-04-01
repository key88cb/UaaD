import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, Calendar, MapPin, Users } from 'lucide-react';


export default function ActivitiesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Placeholder data for the Universal Activity Aggregation view
  const mockActivities = [
    {
      id: "A1092",
      title: "Global Tech Summit 2026",
      organizer: "Tech Innovators Alliance",
      location: "Tokyo, Japan",
      date: "2026-04-15",
      capacity: 12000,
      enrolled: 8430,
      status: "Registration Open",
      statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      id: "A1093",
      title: "Cloud Native Conference Shanghai",
      organizer: "Cloud Foundation",
      location: "Shanghai World Expo",
      date: "2026-05-04",
      capacity: 8000,
      enrolled: 0,
      status: "Warm Up",
      statusColor: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    },
    {
      id: "A1094",
      title: "Esports World Championship Final",
      organizer: "E-Gaming Corp",
      location: "Beijing National Stadium",
      date: "2026-06-12",
      capacity: 50000,
      enrolled: 50000,
      status: "Sold Out",
      statusColor: "text-red-400 bg-red-500/10 border-red-500/20",
    }
  ];

  return (
    <div className="w-full animate-fade-in pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Activity Universe</h2>
          <p className="text-slate-400 text-lg">Discover and manage large-scale events globally.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-blue-600/20">
          <Plus size={20} />
          Create Event
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-slate-900/40 p-4 rounded-2xl border border-white/5 backdrop-blur-sm shadow-xl">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input 
            type="text" 
            placeholder="Search events by name, location, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
        </div>
        <button className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-3 rounded-xl font-medium transition-colors border border-slate-700">
          <Filter size={20} />
          Filters
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockActivities.map((activity, idx) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl hover:border-blue-500/30 transition-all group group-hover:shadow-blue-500/10 flex flex-col"
          >
            {/* Banner Area */}
            <div className="h-32 bg-gradient-to-br from-slate-800 to-slate-900 relative border-b border-slate-800 overflow-hidden">
               {/* Abstract pattern mock */}
               <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent group-hover:opacity-40 transition-opacity duration-500"></div>
               <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${activity.statusColor} backdrop-blur-md`}>
                    {activity.status}
                  </span>
               </div>
            </div>

            {/* Content Area */}
            <div className="p-6 flex-1 flex flex-col">
              <div className="mb-4">
                <span className="text-xs font-mono text-slate-500 mb-2 block">{activity.id}</span>
                <h3 className="text-xl font-bold text-slate-100 group-hover:text-blue-400 transition-colors leading-tight mb-1">{activity.title}</h3>
                <p className="text-sm text-slate-400">{activity.organizer}</p>
              </div>

              <div className="mt-auto space-y-3 pt-4 border-t border-slate-800/50">
                <div className="flex items-center gap-3 text-slate-300 text-sm">
                  <Calendar size={16} className="text-slate-500" />
                  {activity.date}
                </div>
                <div className="flex items-center gap-3 text-slate-300 text-sm">
                  <MapPin size={16} className="text-slate-500" />
                  {activity.location}
                </div>
                <div className="flex items-center gap-3 text-slate-300 text-sm">
                  <Users size={16} className="text-slate-500" />
                  <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                     <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${(activity.enrolled / activity.capacity) * 100}%` }}
                     ></div>
                  </div>
                  <span className="text-xs text-slate-500 w-12 text-right">
                    {Math.round((activity.enrolled / activity.capacity) * 100)}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-slate-950/30 border-t border-slate-800 text-center">
               <button className="text-sm font-medium text-blue-400 hover:text-blue-300 w-full transition-colors">
                 Manage Event &rarr;
               </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
