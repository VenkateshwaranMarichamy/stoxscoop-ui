import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select } from '../components/ui/Select';
import { StockAutocomplete } from '../components/ui/StockAutocomplete';
import { DynamicEventFields, getDynamicFields } from '../components/DynamicEventFields';
import { useStocks, useCreateBatchWithEvents, useSubtypes } from '../hooks/useApi';
import { Plus, Trash2, Copy, Save, Send, AlertCircle, Info, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { EVENT_TYPE_SUMMARIES, SUBTYPE_SUMMARIES } from '../utils/eventSummaries';

const EVENT_TYPES = [
  'corporate_action', 'disclosure', 'insider', 'business', 
  'governance', 'credit_rating', 'financials', 'fundraising', 'legal'
];

const emptyEvent = {
  stock_id: '',
  event_type: '',
  event_subtype: '',
  title: '',
  summary: '',
  event_date: new Date().toISOString().split('T')[0],
  priority: 'low',
  impact_score: 1,
  source_url: '',
  detail: { currency: 'INR' }
};

// Inline summary banner shown below a dropdown
function SummaryBanner({ text }) {
  if (!text) return null;
  return (
    <div className="flex items-start gap-2 mt-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700 leading-relaxed">
      <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-400" />
      <span>{text}</span>
    </div>
  );
}

function SubtypeSelector({ eventType, value, onChange, error }) {
  const { data: subtypes, isLoading, isError } = useSubtypes(eventType);
  return (
    <Select value={value} onChange={e => onChange(e.target.value)} disabled={isLoading || isError || !eventType} error={error}>
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
  const [validationErrors, setValidationErrors] = useState({ batch: {}, events: {} });
  // Partial ingestion state
  const [partialResult, setPartialResult] = useState(null); // { created, failed, results[] }
  const [eventStatuses, setEventStatuses] = useState({}); // { eventId: 'created' | 'failed' | 'pending' }
  const lastPayloadRef = useRef([]); // maps submission index → event id

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

  const handleBatchChange = (e) => {
    const { name, value } = e.target;
    setBatch({ ...batch, [name]: value });
    if (validationErrors.batch[name]) {
        setValidationErrors(prev => ({
            ...prev,
            batch: { ...prev.batch, [name]: false }
        }));
    }
  };

  const handleEventChange = (id, updatedFields) => {
    setEvents(events.map(ev => ev.id === id ? { ...ev, ...updatedFields } : ev));
    
    // Clear validation errors for changed fields
    if (validationErrors.events[id]) {
        const newEventErrors = { ...validationErrors.events[id] };
        let changed = false;
        Object.keys(updatedFields).forEach(key => {
            if (key === 'detail' && updatedFields.detail) {
                Object.keys(updatedFields.detail).forEach(detailKey => {
                    if (newEventErrors[detailKey]) {
                        newEventErrors[detailKey] = false;
                        changed = true;
                    }
                });
            } else if (newEventErrors[key]) {
                newEventErrors[key] = false;
                changed = true;
            }
        });
        if (changed) {
            setValidationErrors(prev => ({
                ...prev,
                events: { ...prev.events, [id]: newEventErrors }
            }));
        }
    }
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

  const handleSubmit = (retryOnly = false) => {
    // On retry, only validate + send failed events
    const eventsToSubmit = retryOnly
      ? events.filter(ev => eventStatuses[ev.id] === 'failed')
      : events;

    const newValidationErrors = { batch: {}, events: {} };
    let hasErrors = false;

    if (!retryOnly && !batch.batch_name) {
        newValidationErrors.batch.batch_name = true;
        hasErrors = true;
    }
    
    eventsToSubmit.forEach(ev => {
        const eventErrors = {};
        if (!ev.stock_id) eventErrors.stock_id = true;
        if (!ev.title) eventErrors.title = true;
        if (!ev.event_type) eventErrors.event_type = true;
        if (!ev.event_subtype) eventErrors.event_subtype = true;
        
        if (ev.event_type && ev.event_subtype) {
            const dynamicFieldsConfig = getDynamicFields(ev.event_type, ev.event_subtype);
            dynamicFieldsConfig.forEach(field => {
                const val = ev.detail?.[field.name];
                if (field.req && (val === undefined || val === null || val === '')) {
                    eventErrors[field.name] = true;
                }
            });
        }
        
        if (Object.keys(eventErrors).length > 0) {
            newValidationErrors.events[ev.id] = eventErrors;
            hasErrors = true;
        }
    });
    
    if (hasErrors) {
        setValidationErrors(newValidationErrors);
        setError('Please check events. Ensure all mandatory fields (marked with *) are correctly filled out.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    setError(null);
    setValidationErrors({ batch: {}, events: {} });

    // Build payload — track index→eventId mapping for partial result handling
    const indexToEventId = {};
    const payloadEvents = eventsToSubmit.map(({ id, ...rest }, idx) => {
        indexToEventId[idx] = id;
        return {
            ...rest,
            stock_id: parseInt(rest.stock_id, 10),
            impact_score: parseInt(rest.impact_score, 10),
            summary: rest.summary || null,
        };
    });
    lastPayloadRef.current = indexToEventId;

    createBatch({
        batch_name: batch.batch_name,
        notes: batch.notes || null,
        events: payloadEvents,
    }, {
        onSuccess: (response) => {
            // Check for partial ingestion
            const failed  = response?.failed  ?? 0;
            const created = response?.created ?? 0;
            const results = response?.results ?? [];

            if (failed === 0) {
                // Full success
                clearDraft();
                navigate('/dashboard');
                return;
            }

            // Partial success — update per-event statuses
            const newStatuses = { ...eventStatuses };
            results.forEach(r => {
                const eventId = lastPayloadRef.current[r.index];
                if (eventId) newStatuses[eventId] = r.status; // 'created' or 'failed'
            });
            setEventStatuses(newStatuses);
            setPartialResult({ created, failed, results, indexToEventId });
            window.scrollTo({ top: 0, behavior: 'smooth' });
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

      {/* Partial ingestion result banner */}
      {partialResult && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <p className="font-semibold text-amber-800">Partial Ingestion</p>
                <p className="text-sm text-amber-700 mt-0.5">
                  <span className="font-bold text-emerald-700">{partialResult.created} event{partialResult.created !== 1 ? 's' : ''} published</span>
                  {' · '}
                  <span className="font-bold text-red-600">{partialResult.failed} failed</span>
                  {' — fix the errors below and retry'}
                </p>
              </div>
            </div>
            <button onClick={() => setPartialResult(null)} className="text-amber-400 hover:text-amber-700">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
          {/* Per-item result list */}
          <div className="space-y-1 pl-7">
            {partialResult.results.map(r => (
              <div key={r.index} className={`flex items-center gap-2 text-xs ${r.status === 'created' ? 'text-emerald-700' : 'text-red-600'}`}>
                {r.status === 'created'
                  ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  : <XCircle className="w-3.5 h-3.5 shrink-0" />
                }
                <span className="font-medium">Event #{r.index + 1}:</span>
                {r.status === 'created'
                  ? <span>Published successfully {r.id ? `(ID: ${r.id})` : ''}</span>
                  : <span>{r.error}</span>
                }
              </div>
            ))}
          </div>
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
            <Input 
              name="batch_name" 
              value={batch.batch_name} 
              onChange={handleBatchChange} 
              placeholder="e.g. Morning Tech Updates 24th Oct" 
              className="text-lg py-5"
              error={validationErrors.batch.batch_name}
            />
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
        
        {events.map((event, index) => {
          const status = eventStatuses[event.id]; // 'created' | 'failed' | undefined
          const isCreated = status === 'created';
          const isFailed  = status === 'failed';

          return (
          <Card key={event.id} className={`relative overflow-hidden group transition-all ${
            isCreated ? 'border-emerald-300 bg-emerald-50/30 opacity-75' :
            isFailed  ? 'border-red-300 shadow-md' :
            'border-slate-200 hover:border-emerald-300 hover:shadow-md'
          }`}>
            <div className={`absolute top-0 left-0 w-1 h-full transition-opacity ${
              isCreated ? 'bg-emerald-500 opacity-100' :
              isFailed  ? 'bg-red-500 opacity-100' :
              'bg-emerald-500 opacity-0 group-hover:opacity-100'
            }`} />
            <div className="p-1.5 bg-slate-50 border-b border-slate-100 flex justify-between items-center px-4">
               <div className="flex items-center gap-2">
                 <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Event #{index + 1}</span>
                 {isCreated && (
                   <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                     <CheckCircle2 className="w-3 h-3" /> Published
                   </span>
                 )}
                 {isFailed && (
                   <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                     <XCircle className="w-3 h-3" /> Failed — fix and retry
                   </span>
                 )}
               </div>
               {!isCreated && (
                 <div className="space-x-2">
                   <Button variant="ghost" size="sm" onClick={() => duplicateEvent(event)} className="h-7 text-xs px-2"><Copy className="w-3 h-3 mr-1" /> Duplicate</Button>
                   {events.length > 1 && (
                       <Button variant="ghost" size="sm" onClick={() => removeEvent(event.id)} className="h-7 text-xs px-2 text-red-600 hover:text-red-700 hover:bg-red-50"><Trash2 className="w-3 h-3 mr-1" /> Remove</Button>
                   )}
                 </div>
               )}
            </div>
            
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
              {isCreated ? (
                // Collapsed read-only view for published events
                <div className="md:col-span-12 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-800">{event.title}</span>
                      <span className="ml-3 text-slate-400">
                        {event.event_type?.replace(/_/g, ' ')} · {event.event_subtype?.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded-full">
                    Saved to backend
                  </span>
                </div>
              ) : (
              <>
              <div className="md:col-span-4 space-y-4">
                  <div>
                    <Label>Stock <span className="text-red-500">*</span></Label>
                    <StockAutocomplete
                      value={event.stock_id}
                      onChange={(val) => handleEventChange(event.id, { stock_id: val })}
                      returnType="id"
                      error={validationErrors.events[event.id]?.stock_id}
                    />
                  </div>
                  <div>
                    <Label>Event Type <span className="text-red-500">*</span></Label>
                    <Select 
                      value={event.event_type} 
                      onChange={e => handleEventChange(event.id, { event_type: e.target.value, event_subtype: '', detail: {} })}
                      error={validationErrors.events[event.id]?.event_type}
                    >
                      <option value="">Select type...</option>
                      {EVENT_TYPES.map((type) => (
                        <option key={type} value={type}>{type.replace(/_/g, ' ').toUpperCase()}</option>
                      ))}
                    </Select>
                    <SummaryBanner text={EVENT_TYPE_SUMMARIES[event.event_type]} />
                  </div>
                  <div>
                    <Label>Event Subtype <span className="text-red-500">*</span></Label>
                    <SubtypeSelector 
                      eventType={event.event_type} 
                      value={event.event_subtype} 
                      onChange={val => handleEventChange(event.id, { event_subtype: val, detail: {} })} 
                      error={validationErrors.events[event.id]?.event_subtype}
                    />
                    <SummaryBanner text={SUBTYPE_SUMMARIES[`${event.event_type}_${event.event_subtype}`] ?? SUBTYPE_SUMMARIES[event.event_subtype]} />
                  </div>
                  <div>
                    <Label>Date <span className="text-red-500">*</span></Label>
                    <Input type="date" value={event.event_date} onChange={e => handleEventChange(event.id, { event_date: e.target.value })} />
                  </div>
              </div>
              
              <div className="md:col-span-8 space-y-4">
                <div>
                   <Label>Headline / Title <span className="text-red-500">*</span></Label>
                   <Input 
                     value={event.title} 
                     onChange={e => handleEventChange(event.id, { title: e.target.value })} 
                     placeholder="e.g. Promoter buys 5% stake from open market" 
                     className="font-medium" 
                     error={validationErrors.events[event.id]?.title}
                   />
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
                    validationErrors={validationErrors.events[event.id]}
                />

                <div>
                   <Label>Description <span className="text-slate-400 font-normal text-xs">(sent as summary)</span></Label>
                   <textarea
                     value={event.summary}
                     onChange={e => handleEventChange(event.id, { summary: e.target.value })}
                     placeholder="Brief description of this event and its significance..."
                     rows={3}
                     className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent resize-none leading-relaxed"
                   />
                </div>
                <div>
                   <Label>Source URL (Optional)</Label>
                   <Input value={event.source_url} onChange={e => handleEventChange(event.id, { source_url: e.target.value })} placeholder="https://..." className="text-emerald-600" />
                </div>
              </div>
              </>
              )}
            </CardContent>
          </Card>
          );
        })}
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
                 {partialResult ? (
                   <Button size="lg"
                     className="min-w-[160px] shadow-lg shadow-amber-500/30 bg-amber-500 hover:bg-amber-600 text-white border-none"
                     onClick={() => handleSubmit(true)}
                     disabled={isPending}
                   >
                     {isPending
                       ? 'Retrying...'
                       : <><RefreshCw className="w-4 h-4 mr-2" /> Retry {partialResult.failed} Failed</>
                     }
                   </Button>
                 ) : (
                   <Button size="lg"
                     className="min-w-[150px] shadow-lg shadow-emerald-500/30 bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                     onClick={() => handleSubmit(false)}
                     disabled={isPending}
                   >
                     {isPending ? 'Publishing...' : <><Send className="w-4 h-4 mr-2" /> Publish Batch</>}
                   </Button>
                 )}
             </div>
         </div>
      </div>
    </div>
  );
}
