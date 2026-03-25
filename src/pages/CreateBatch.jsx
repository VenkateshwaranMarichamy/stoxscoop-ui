import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select } from '../components/ui/Select';
import { StockAutocomplete } from '../components/ui/StockAutocomplete';
import { DynamicEventFields } from '../components/DynamicEventFields';
import { useStocks, useCreateBatchWithEvents, useSubtypes } from '../hooks/useApi';
import { Plus, Trash2, Copy, Save, Send, AlertCircle, Loader2 } from 'lucide-react';

const EVENT_TYPES = [
  'corporate_action', 'disclosure', 'insider', 'business', 
  'governance', 'credit_rating', 'financials', 'fundraising', 'legal'
];

const emptyEvent = {
  stock_id: '',
  event_type: '',
  event_subtype: '',
  title: '',
  event_date: new Date().toISOString().split('T')[0],
  priority: 'low',
  impact_score: 1,
  source_url: '',
  detail: { currency: 'INR' }
};

function SubtypeSelector({ eventType, value, onChange }) {
  const { data: subtypes, isLoading, isError } = useSubtypes(eventType);
  return (
    <Select value={value} onChange={e => onChange(e.target.value)} disabled={isLoading || isError || !eventType}>
      <option value="">{isLoading ? 'Loading...' : isError ? 'Error (API unreachable)' : 'Select...'}</option>
      {subtypes?.map(s => (
        <option key={s.subtype_code} value={s.subtype_code}>{s.label}</option>
      ))}
    </Select>
  );
}

export default function CreateBatch() {
  const navigate = useNavigate();
  const { data: stocks } = useStocks();
  const { mutate: createBatch, isPending } = useCreateBatchWithEvents();

  const [batch, setBatch] = useState({ batch_name: '', notes: '' });
  const [events, setEvents] = useState([{ ...emptyEvent, id: Date.now() }]);
  const [error, setError] = useState(null);

  // Load from Draft
  useEffect(() => {
    const draftContent = localStorage.getItem('stoxscoop_draft');
    if (draftContent) {
        try {
            const parsed = JSON.parse(draftContent);
            if (parsed.batch) setBatch(parsed.batch);
            if (parsed.events) setEvents(parsed.events);
        } catch(e) {}
    }
  }, []);

  const saveDraft = () => {
    localStorage.setItem('stoxscoop_draft', JSON.stringify({ batch, events }));
    alert('Draft saved locally.');
  };

  const clearDraft = () => {
    localStorage.removeItem('stoxscoop_draft');
  }

  const handleBatchChange = (e) => setBatch({ ...batch, [e.target.name]: e.target.value });

  const handleEventChange = (id, updatedFields) => {
    setEvents(events.map(ev => ev.id === id ? { ...ev, ...updatedFields } : ev));
  };

  const addEvent = () => {
    setEvents([...events, { ...emptyEvent, id: Date.now() }]);
  };

  const duplicateEvent = (event) => {
    setEvents([...events, { ...event, id: Date.now() }]);
  };

  const removeEvent = (id) => {
    if (events.length === 1) return;
    setEvents(events.filter(ev => ev.id !== id));
  };

  const handleSubmit = () => {
    if (!batch.batch_name) {
        setError('Batch name is required.');
        window.scrollTo(0, 0);
        return;
    }
    
    const hasInvalidEvents = events.some(ev => {
        if (!ev.stock_id || !ev.title || !ev.event_type || !ev.event_subtype) return true;
        return false;
    });
    
    if (hasInvalidEvents) {
        setError('Please check events. Ensure all mandatory fields (marked with *) are correctly filled out.');
        return;
    }

    // Clean up internal `id` before submitting
    const payloadEvents = events.map(({ id, ...rest }) => ({
        ...rest,
        stock_id: parseInt(rest.stock_id, 10),
        impact_score: parseInt(rest.impact_score, 10)
    }));

    createBatch({
        batch_name: batch.batch_name,
        notes: batch.notes || null,
        events: payloadEvents
    }, {
        onSuccess: () => {
            clearDraft();
            navigate('/dashboard');
        },
        onError: (err) => {
            setError('Failed to create batch: ' + (err.response?.data?.detail || err.message));
        }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create Event Batch</h1>
        <p className="text-slate-500 mt-1">Add multiple market events in one contiguous session.</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
            <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* STEP 1: Batch Details */}
      <Card className="border-emerald-100 shadow-sm">
        <CardHeader className="bg-emerald-50/50 rounded-t-xl border-b border-emerald-50 pb-4">
          <CardTitle className="text-emerald-800 flex items-center">
             <span className="bg-emerald-600 text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm mr-2">1</span>
             Batch Details
          </CardTitle>
          <CardDescription>Group these events under a descriptive batch name</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div>
            <Label>Batch Name <span className="text-red-500">*</span></Label>
            <Input name="batch_name" value={batch.batch_name} onChange={handleBatchChange} placeholder="e.g. Morning Tech Updates 24th Oct" className="text-lg py-5" />
          </div>
          <div>
            <Label>Notes (Optional)</Label>
            <Input name="notes" value={batch.notes} onChange={handleBatchChange} placeholder="Context for these events..." />
          </div>
        </CardContent>
      </Card>

      {/* STEP 2: Events List */}
      <div className="space-y-4">
        <div className="bg-emerald-50/50 rounded-xl border border-emerald-100 p-4 mb-2">
            <h2 className="text-emerald-800 text-xl font-bold flex items-center">
                <span className="bg-emerald-600 text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm mr-2">2</span>
                Events ({events.length})
            </h2>
            <p className="text-sm text-slate-500 mt-1 ml-8">Add individual events to this batch below</p>
        </div>
        
        {events.map((event, index) => (
          <Card key={event.id} className="relative overflow-hidden group border-slate-200 transition-all hover:border-emerald-300 hover:shadow-md">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="p-1.5 bg-slate-50 border-b border-slate-100 flex justify-between items-center px-4">
               <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Event #{index + 1}</span>
               <div className="space-x-2">
                 <Button variant="ghost" size="sm" onClick={() => duplicateEvent(event)} className="h-7 text-xs px-2"><Copy className="w-3 h-3 mr-1" /> Duplicate</Button>
                 {events.length > 1 && (
                     <Button variant="ghost" size="sm" onClick={() => removeEvent(event.id)} className="h-7 text-xs px-2 text-red-600 hover:text-red-700 hover:bg-red-50"><Trash2 className="w-3 h-3 mr-1" /> Remove</Button>
                 )}
               </div>
            </div>
            
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-4 space-y-4">
                  <div>
                    <Label>Stock <span className="text-red-500">*</span></Label>
                    <StockAutocomplete
                      value={event.stock_id}
                      onChange={(val) => handleEventChange(event.id, { stock_id: val })}
                      returnType="id"
                    />
                  </div>
                  <div>
                    <Label>Event Type <span className="text-red-500">*</span></Label>
                    <Select value={event.event_type} onChange={e => handleEventChange(event.id, { event_type: e.target.value, event_subtype: '', detail: {} })}>
                      {EVENT_TYPES.map((type) => (
                        <option key={type} value={type}>{type.replace('_', ' ').toUpperCase()}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label>Event Subtype <span className="text-red-500">*</span></Label>
                    <SubtypeSelector 
                      eventType={event.event_type} 
                      value={event.event_subtype} 
                      onChange={val => handleEventChange(event.id, { event_subtype: val, detail: {} })} 
                    />
                  </div>
                  <div>
                    <Label>Date <span className="text-red-500">*</span></Label>
                    <Input type="date" value={event.event_date} onChange={e => handleEventChange(event.id, { event_date: e.target.value })} />
                  </div>
              </div>
              
              <div className="md:col-span-8 space-y-4">
                <div>
                   <Label>Headline / Title <span className="text-red-500">*</span></Label>
                   <Input value={event.title} onChange={e => handleEventChange(event.id, { title: e.target.value })} placeholder="e.g. Promoter buys 5% stake from open market" className="font-medium" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Priority</Label>
                        <Select value={event.priority} onChange={e => handleEventChange(event.id, { priority: e.target.value })}>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </Select>
                    </div>
                    <div>
                        <Label>Impact Score (1-10)</Label>
                        <div className="flex items-center space-x-3">
                            <input 
                              type="range" min="1" max="10" 
                              value={event.impact_score} 
                              onChange={e => handleEventChange(event.id, { impact_score: e.target.value })} 
                              className="w-full accent-emerald-600"
                            />
                            <span className="font-bold w-6 text-center text-slate-700">{event.impact_score}</span>
                        </div>
                    </div>
                </div>

                <DynamicEventFields 
                    eventType={event.event_type} 
                    event={event} 
                    onChange={(updated) => handleEventChange(event.id, updated)} 
                />

                <div>
                   <Label>Source URL (Optional)</Label>
                   <Input value={event.source_url} onChange={e => handleEventChange(event.id, { source_url: e.target.value })} placeholder="https://..." className="text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center pt-2">
         <Button variant="outline" onClick={addEvent} className="w-full max-w-sm border-dashed border-2 border-slate-300 text-slate-600 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 group">
             <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
             Add Another Event
         </Button>
      </div>

      {/* Sticky Action Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur border-t border-slate-200 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-20">
         <div className="max-w-4xl mx-auto flex justify-between items-center">
             <Button variant="ghost" className="text-slate-500" onClick={saveDraft}>
                 <Save className="w-4 h-4 mr-2" /> Save as Draft
             </Button>
             
             <div className="flex items-center space-x-4">
                 <span className="text-sm font-medium text-slate-500">{events.length} event(s) in batch</span>
                 <Button size="lg" className="min-w-[150px] shadow-lg shadow-emerald-500/30 bg-emerald-600 hover:bg-emerald-700 text-white border-none" onClick={handleSubmit} disabled={isPending}>
                     {isPending ? 'Publishing...' : <><Send className="w-4 h-4 mr-2" /> Publish Batch</>}
                 </Button>
             </div>
         </div>
      </div>
    </div>
  );
}
