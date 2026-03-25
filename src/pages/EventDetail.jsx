import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvent, useStocks } from '../hooks/useApi';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ArrowLeft, ExternalLink, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: event, isLoading, error } = useEvent(id);
  const { data: stocks } = useStocks();

  if (isLoading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading event details...</div>;
  if (error || !event) return <div className="p-8 text-center text-red-500 text-xl font-bold">Event not found.</div>;

  const stock = stocks?.find(s => s.id === event.stock_id);
  const dynamicDetails = event.detail;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <Button variant="ghost" onClick={() => navigate(-1)} className="-ml-4 text-slate-600">
           <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
       </Button>

       <Card className="border-slate-200 shadow-sm overflow-hidden">
         <div className="h-2 w-full bg-gradient-to-r from-emerald-500 to-teal-600" />
         <CardContent className="p-8">
            <div className="flex justify-between items-start mb-6">
                <div>
                   <div className="flex items-center space-x-3 mb-3">
                       <span className="text-2xl font-black text-slate-900 tracking-tight">{stock?.symbol}</span>
                       <Badge variant="outline" className="text-sm bg-slate-50 font-medium uppercase">
                           {event.event_type.replace(/_/g, ' ')}
                       </Badge>
                       {event.event_subtype && (
                          <Badge variant="secondary" className="text-sm bg-emerald-50 text-emerald-700 uppercase">
                              {event.subtype_label || event.event_subtype.replace(/_/g, ' ')}
                          </Badge>
                       )}
                       {event.priority === 'high' && <Badge variant="destructive" className="animate-pulse shadow-sm shadow-red-200">HIGH PRIORITY</Badge>}
                   </div>
                   <h1 className="text-3xl font-bold text-slate-800 leading-tight">{event.title}</h1>
                </div>
                <div className="text-right">
                    <div className="text-5xl font-black text-slate-200 tracking-tighter mb-1">
                        {event.impact_score}<span className="text-2xl text-slate-300">/10</span>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Impact Score</span>
                </div>
            </div>

            <div className="flex items-center space-x-6 text-sm text-slate-600 mb-8 border-y border-slate-100 py-4">
                <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-emerald-500" />
                    <span className="font-medium text-slate-800">{format(new Date(event.event_date), 'MMMM dd, yyyy')}</span>
                </div>
                {event.source_url && (
                    <div className="flex items-center">
                        <ExternalLink className="w-4 h-4 mr-2 text-slate-400" />
                        {event.source_url.startsWith('http') ? (
                           <a href={event.source_url} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline font-medium">Source Documentation</a>
                        ) : (
                           <span className="text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded text-xs">{event.source_url}</span>
                        )}
                    </div>
                )}
            </div>

            {dynamicDetails && (
                <div className="bg-slate-50/80 rounded-xl p-6 border border-slate-100">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Event Specific Details</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                        {Object.entries(dynamicDetails).filter(([key]) => key !== 'currency').map(([key, value]) => {
                            if (value === null || value === undefined) return null;
                            
                            const isCr = (key.includes('amount') && key !== 'amount_per_share') || key.includes('value') || key.includes('size') || ['revenue', 'ebitda', 'pat'].includes(key);
                            const isPerShare = key.includes('price') || key.includes('per_share') || key === 'upside';
                            
                            let displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;
                            if ((isCr || isPerShare) && value !== '') {
                               const curr = dynamicDetails.currency || 'INR';
                               const numValue = parseFloat(value);
                               const formattedValue = isNaN(numValue) ? value : numValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                               displayValue = `${curr} ${formattedValue}${isCr ? ' Cr' : ''}`;
                            }

                            return (
                                <div key={key}>
                                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                        {key.replace(/_/g, ' ')}
                                    </div>
                                    <div className="text-slate-900 font-medium text-lg">
                                        {displayValue}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
         </CardContent>
       </Card>
    </div>
  );
}
