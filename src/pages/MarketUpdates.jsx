import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMarketUpdates } from '../hooks/useApi';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { format } from 'date-fns';
import { Plus, Filter, Calendar } from 'lucide-react';

export const MARKET_UPDATE_CATEGORIES = [
  { value: 'POLICY',     label: 'Policy' },
  { value: 'GROWTH',     label: 'Growth' },
  { value: 'DEMAND',     label: 'Demand' },
  { value: 'EARNINGS',   label: 'Earnings' },
  { value: 'RESULTS',    label: 'Results' },
  { value: 'REGULATION', label: 'Regulation' },
  { value: 'MERGER',     label: 'Merger' },
  { value: 'SUPPLY',     label: 'Supply' },
  { value: 'MACRO',      label: 'Macro' },
  { value: 'OTHER',      label: 'Other' },
];

const CATEGORY_COLORS = {
  POLICY:     'bg-amber-100 text-amber-700 border-amber-200',
  GROWTH:     'bg-emerald-100 text-emerald-700 border-emerald-200',
  DEMAND:     'bg-blue-100 text-blue-700 border-blue-200',
  EARNINGS:   'bg-cyan-100 text-cyan-700 border-cyan-200',
  RESULTS:    'bg-teal-100 text-teal-700 border-teal-200',
  REGULATION: 'bg-slate-100 text-slate-700 border-slate-200',
  MERGER:     'bg-purple-100 text-purple-700 border-purple-200',
  SUPPLY:     'bg-orange-100 text-orange-700 border-orange-200',
  MACRO:      'bg-indigo-100 text-indigo-700 border-indigo-200',
  OTHER:      'bg-gray-100 text-gray-600 border-gray-200',
};

const SENTIMENT_COLORS = {
  positive: 'bg-emerald-100 text-emerald-700',
  negative: 'bg-red-100 text-red-700',
  neutral:  'bg-slate-100 text-slate-600',
};

export default function MarketUpdates() {
  const [filters, setFilters] = useState({
    category: '', sentiment: '', impact: '',
    date_from: '', date_to: '',
  });
  const [pagination, setPagination] = useState({ skip: 0, limit: 20 });

  const activeFilters = Object.fromEntries(
    Object.entries({ ...filters, offset: pagination.skip, limit: pagination.limit })
      .filter(([, v]) => v !== '')
  );

  const { data, isLoading } = useMarketUpdates(activeFilters);
  const items = Array.isArray(data) ? data : data?.items ?? [];
  const total = data?.total_records;

  const setDateRange = (period) => {
    const today = new Date();
    const to = today.toISOString().split('T')[0];
    let from = to;
    if (period === 'week') {
      const d = new Date(today); d.setDate(d.getDate() - 7);
      from = d.toISOString().split('T')[0];
    } else if (period === 'month') {
      const d = new Date(today); d.setMonth(d.getMonth() - 1);
      from = d.toISOString().split('T')[0];
    }
    setFilters(f => ({ ...f, date_from: from, date_to: to }));
    setPagination(p => ({ ...p, skip: 0 }));
  };

  const hasNext = total ? pagination.skip + pagination.limit < total : items.length === pagination.limit;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Market Updates</h1>
          <p className="text-slate-500 mt-1">Macro signals, policy moves, and product-level news.</p>
        </div>
        <div className="flex items-center space-x-2">
          {['today', 'week', 'month'].map(p => (
            <Button key={p} variant="outline" size="sm" onClick={() => setDateRange(p)} className="text-sm bg-white shadow-sm border-slate-200 capitalize">
              <Calendar className="w-4 h-4 mr-1.5 text-slate-400" /> {p === 'today' ? 'Today' : `This ${p.charAt(0).toUpperCase() + p.slice(1)}`}
            </Button>
          ))}
          <Link to="/market-updates/create">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-sm">
              <Plus className="w-4 h-4 mr-1" /> Add Update
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-slate-200/60 shadow-sm bg-white/50">
        <CardContent className="p-4 grid grid-cols-2 md:grid-cols-6 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</label>
            <Select value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
              <option value="">All Categories</option>
              {MARKET_UPDATE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sentiment</label>
            <Select value={filters.sentiment} onChange={e => setFilters(f => ({ ...f, sentiment: e.target.value }))}>
              <option value="">All</option>
              <option value="positive">Positive</option>
              <option value="negative">Negative</option>
              <option value="neutral">Neutral</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Impact</label>
            <Select value={filters.impact} onChange={e => setFilters(f => ({ ...f, impact: e.target.value }))}>
              <option value="">All</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">From</label>
            <Input type="date" value={filters.date_from} onChange={e => setFilters(f => ({ ...f, date_from: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">To</label>
            <Input type="date" value={filters.date_to} min={filters.date_from} onChange={e => setFilters(f => ({ ...f, date_to: e.target.value }))} />
          </div>
          <div className="flex items-end">
            <Button variant="outline" size="sm" className="w-full bg-white" onClick={() => { setFilters({ category: '', sentiment: '', impact: '', date_from: '', date_to: '' }); setPagination({ skip: 0, limit: 20 }); }}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200 sticky top-0">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Title</th>
                <th className="px-6 py-4 font-medium">Entities</th>
                <th className="px-6 py-4 font-medium">Sentiment</th>
                <th className="px-6 py-4 font-medium">Impact</th>
                <th className="px-6 py-4 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                  <div className="flex justify-center items-center space-x-2">
                    <div className="w-4 h-4 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
                    <span className="animate-pulse">Loading...</span>
                  </div>
                </td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-500 bg-slate-50/50">
                  <Filter className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                  <p className="font-medium text-slate-600">No market updates found</p>
                  <p className="text-xs mt-1">Try adjusting filters or add a new update.</p>
                </td></tr>
              ) : items.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">
                    {item.published_at ? format(new Date(item.published_at), 'MMM dd, yyyy') : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="outline" className={`uppercase shadow-sm ${CATEGORY_COLORS[item.category] ?? 'bg-slate-100 text-slate-600'}`}>
                      {MARKET_UPDATE_CATEGORIES.find(c => c.value === item.category)?.label ?? item.category}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900 min-w-[280px]">
                    <p className="line-clamp-2" title={item.title}>{item.title}</p>
                    {item.source && <span className="text-xs text-slate-400">{item.source}</span>}
                  </td>
                  <td className="px-6 py-4 max-w-[180px]">
                    <div className="flex flex-wrap gap-1">
                      {(item.entities ?? []).slice(0, 3).map(e => (
                        <span key={e} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">{e}</span>
                      ))}
                      {(item.entities ?? []).length > 3 && (
                        <span className="text-[10px] text-slate-400">+{item.entities.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.sentiment && (
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${SENTIMENT_COLORS[item.sentiment] ?? 'bg-slate-100 text-slate-600'}`}>
                        {item.sentiment}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.impact && (
                      <span className={`text-xs font-bold uppercase ${item.impact === 'high' ? 'text-red-600' : item.impact === 'medium' ? 'text-amber-600' : 'text-slate-500'}`}>
                        {item.impact}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-xs text-slate-400 font-mono">#{item.id}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex justify-between items-center p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
          <Button variant="outline" size="sm" disabled={pagination.skip === 0} className="bg-white"
            onClick={() => { setPagination(p => ({ ...p, skip: Math.max(0, p.skip - p.limit) })); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            Previous
          </Button>
          <span className="text-xs text-slate-500 font-medium">
            {total !== undefined ? `${total} total` : `${items.length} results`}
          </span>
          <Button variant="outline" size="sm" disabled={!hasNext} className="bg-white"
            onClick={() => { setPagination(p => ({ ...p, skip: p.skip + p.limit })); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            Next
          </Button>
        </div>
      </Card>
    </div>
  );
}
