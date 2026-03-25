import React, { useState } from 'react';
import { useEvents, useStocks, useSubtypes } from '../hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { StockAutocomplete } from '../components/ui/StockAutocomplete';
import { format } from 'date-fns';
import { Search, Filter, AlertCircle, Calendar, DollarSign, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';

const EVENT_TYPES = [
  'corporate_action', 'disclosure', 'insider', 'business', 
  'governance', 'credit_rating', 'financials', 'fundraising', 'legal'
];

function SubtypeFilter({ eventType, value, onChange }) {
  const { data: subtypes, isLoading, isError } = useSubtypes(eventType);
  return (
    <Select value={value} onChange={e => onChange(e.target.value)} disabled={isLoading || isError || !eventType}>
      <option value="">{isLoading ? 'Loading...' : isError ? 'API Error' : !eventType ? 'Select Type First' : 'All Subtypes'}</option>
      {subtypes?.map(s => (
        <option key={s.subtype_code} value={s.subtype_code}>{s.label}</option>
      ))}
    </Select>
  );
}

export default function Dashboard() {
  const [filters, setFilters] = useState({
    stock_id: '',
    event_type: '',
    event_subtype: '',
    priority: '',
    date_from: '',
    date_to: '',
  });
  const [pagination, setPagination] = useState({ skip: 0, limit: 20 });

  const setDateFiltersTo = (period) => {
    const today = new Date();
    let from = '';
    const to = today.toISOString().split('T')[0];
    if (period === 'today') {
      from = to;
    } else if (period === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      from = weekAgo.toISOString().split('T')[0];
    } else if (period === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(today.getMonth() - 1);
      from = monthAgo.toISOString().split('T')[0];
    }
    setFilters(prev => ({ ...prev, date_from: from, date_to: to }));
    setPagination(p => ({ ...p, skip: 0 }));
  };

  const apiFilters = {
    stock_id: filters.stock_id,
    event_type: filters.event_type,
    event_subtype: filters.event_subtype,
    priority: filters.priority,
    date_from: filters.date_from,
    date_to: filters.date_to,
    active_only: true,
    offset: pagination.skip,
    limit: pagination.limit
  };
  const activeApiFilters = Object.fromEntries(Object.entries(apiFilters).filter(([_, v]) => v !== ''));

  const { data: events, isLoading, error } = useEvents(activeApiFilters);
  const { data: stocks } = useStocks();

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const getPriorityBadge = (priority) => {
    if (priority === 'high') return <Badge variant="destructive" className="animate-pulse shadow-sm shadow-red-200"><AlertCircle className="w-3 h-3 mr-1" /> HIGH</Badge>;
    if (priority === 'medium') return <Badge variant="warning">MEDIUM</Badge>;
    return <Badge variant="secondary">LOW</Badge>;
  };

  const EVENT_COLORS = {
    corporate_action: "bg-blue-100 text-blue-700 border-blue-200",
    disclosure: "bg-indigo-100 text-indigo-700 border-indigo-200",
    insider: "bg-rose-100 text-rose-700 border-rose-200",
    business: "bg-amber-100 text-amber-700 border-amber-200",
    governance: "bg-slate-100 text-slate-700 border-slate-200",
    credit_rating: "bg-purple-100 text-purple-700 border-purple-200",
    financials: "bg-emerald-100 text-emerald-700 border-emerald-200",
    fundraising: "bg-cyan-100 text-cyan-700 border-cyan-200",
    legal: "bg-red-100 text-red-700 border-red-200",
  };

  const getEventBadgeColor = (type) => {
    return EVENT_COLORS[type] || "bg-indigo-100 text-indigo-700 border-indigo-200";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Event Feed</h1>
          <p className="text-slate-500 mt-1">Beyond News. Into Signals.</p>
        </div>
        <div className="flex items-center space-x-2">
           <Button variant="outline" size="sm" onClick={() => setDateFiltersTo('today')} className="text-sm bg-white shadow-sm border-slate-200">
             <Calendar className="w-4 h-4 mr-2 text-slate-400" /> Today
           </Button>
           <Button variant="outline" size="sm" onClick={() => setDateFiltersTo('week')} className="text-sm bg-white shadow-sm border-slate-200">
             <Calendar className="w-4 h-4 mr-2 text-slate-400" /> This Week
           </Button>
           <Button variant="outline" size="sm" onClick={() => setDateFiltersTo('month')} className="text-sm bg-white shadow-sm border-slate-200">
             <Calendar className="w-4 h-4 mr-2 text-slate-400" /> This Month
           </Button>
        </div>
      </div>

      <Card className="border-slate-200/60 shadow-sm bg-white/50 backdrop-blur-xl relative z-20">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <div className="space-y-1.5 md:col-span-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Symbol Search</label>
            <StockAutocomplete
              value={filters.stock_id}
              onChange={(val) => setFilters(prev => ({ ...prev, stock_id: val }))}
              returnType="id"
              placeholder="Search..."
              showIcon={true}
            />
          </div>
          
          <div className="space-y-1.5 md:col-span-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Event Type</label>
            <Select name="event_type" value={filters.event_type} onChange={e => { handleFilterChange(e); setFilters(prev => ({...prev, event_subtype: ''})); }}>
              <option value="">All Types</option>
              {EVENT_TYPES.map(type => (
                <option key={type} value={type}>{type.replace('_', ' ')}</option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5 md:col-span-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Event Subtype</label>
            <SubtypeFilter eventType={filters.event_type} value={filters.event_subtype} onChange={val => setFilters(prev => ({...prev, event_subtype: val}))} />
          </div>

          <div className="space-y-1.5 md:col-span-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</label>
            <Select name="priority" value={filters.priority} onChange={handleFilterChange}>
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
          </div>

          <div className="space-y-1.5 md:col-span-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">From Date</label>
            <Input
              type="date"
              name="date_from"
              value={filters.date_from}
              max={new Date().toISOString().split('T')[0]}
              onChange={handleFilterChange}
              className="h-10 text-slate-700 uppercase"
            />
          </div>

          <div className="space-y-1.5 md:col-span-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">To Date</label>
            <Input
              type="date"
              name="date_to"
              value={filters.date_to}
              min={filters.date_from}
              max={new Date().toISOString().split('T')[0]}
              onChange={handleFilterChange}
              className="h-10 text-slate-700 uppercase"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200 sticky top-0">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium">Event Type</th>
                <th className="px-6 py-4 font-medium">Title</th>
                <th className="px-6 py-4 font-medium">Priority</th>
                <th className="px-6 py-4 font-medium">Impact</th>
                <th className="px-6 py-4 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    <div className="flex justify-center items-center space-x-2">
                       <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                       <span className="animate-pulse">Loading events...</span>
                    </div>
                  </td>
                </tr>
              ) : events?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500 bg-slate-50/50">
                    <Filter className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                    <p className="font-medium text-slate-600">No events found matching your filters</p>
                    <p className="text-xs mt-1">Try adjusting your search criteria or date range.</p>
                  </td>
                </tr>
              ) : (
                events?.map((event) => {
                  const stock = stocks?.find(s => s.id === event.stock_id);
                  const isHighPriority = event.priority === 'high';
                  
                  return (
                    <tr 
                      key={event.id} 
                      className={`hover:bg-slate-50 transition-colors group ${isHighPriority ? 'bg-red-50/30' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">
                        {format(new Date(event.event_date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 hover:text-blue-700 transition-colors cursor-pointer">
                            {stock ? stock.symbol : `ID: ${event.stock_id}`}
                          </span>
                          {stock && <span className="text-xs text-slate-500 max-w-[150px] truncate">{stock.name}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1 items-start">
                          <Badge variant="outline" className={`shadow-sm uppercase ${getEventBadgeColor(event.event_type)}`}>
                            {event.event_type.replace(/_/g, ' ')}
                          </Badge>
                          {event.event_subtype && (
                             <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                                {event.subtype_label || event.event_subtype.replace(/_/g, ' ')}
                             </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900 min-w-[300px] border-transparent">
                        <p className="line-clamp-2" title={event.title}>{event.title}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPriorityBadge(event.priority)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                            <span className="font-semibold text-slate-700">{event.impact_score}</span>
                            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${event.impact_score > 7 ? 'bg-red-500' : event.impact_score > 4 ? 'bg-amber-400' : 'bg-emerald-400'}`} 
                                  style={{ width: `${(event.impact_score / 10) * 100}%` }}
                                />
                            </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link to={`/events/${event.id}`} className="inline-flex items-center text-emerald-600 font-semibold text-sm hover:text-emerald-700 hover:underline">
                          View <ArrowRight className="ml-1 w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="flex justify-between items-center p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
           <Button 
             variant="outline" 
             size="sm" 
             disabled={pagination.skip === 0} 
             onClick={() => setPagination(p => ({...p, skip: Math.max(0, p.skip - p.limit)}))}
           >
             Previous
           </Button>
           <span className="text-sm font-medium text-slate-500">
             Page {Math.floor(pagination.skip / pagination.limit) + 1}
           </span>
           <Button 
             variant="outline" 
             size="sm"
             disabled={!events || events.length < pagination.limit} 
             onClick={() => setPagination(p => ({...p, skip: p.skip + p.limit}))}
           >
             Next
           </Button>
        </div>
      </Card>
    </div>
  );
}
