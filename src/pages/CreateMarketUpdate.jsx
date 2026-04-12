import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateMarketUpdate } from '../hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select } from '../components/ui/Select';
import { IndustryPickerModal } from '../components/IndustryPickerModal';
import { MARKET_UPDATE_CATEGORIES } from './MarketUpdates';
import { Send, Plus, Trash2, AlertCircle, Info, X, Building2 } from 'lucide-react';

// ─── Category hints ──────────────────────────────────────────────────────────
const CATEGORY_SUMMARIES = {
  POLICY:     'Government policy announcements — PLI schemes, import/export duty changes, CLI notifications.',
  GROWTH:     'Growth signals — CAGR data, market expansion, sector growth forecasts.',
  DEMAND:     'Demand-side signals — import volumes, CCTV demand, consumer trends, order flows.',
  EARNINGS:   'Company or sector earnings signals — revenue, margins, profit trends.',
  RESULTS:    'Formal results releases — quarterly/annual numbers, provisional data.',
  REGULATION: 'Regulatory actions — SEBI circulars, RBI guidelines, TRAI orders, compliance changes.',
  MERGER:     'M&A activity — acquisitions, mergers, JVs at a sector or macro level.',
  SUPPLY:     'Supply-side signals — production data, capacity, inventory, raw material availability.',
  MACRO:      'Macro economic data — CPI, IIP, PMI, GDP, repo rate, FX moves.',
  OTHER:      "Any other market-level development that doesn't fit the above.",
};

const METRIC_TYPE_SUGGESTIONS = {
  POLICY:     ['pli_outlay', 'duty_change', 'subsidy_amount', 'beneficiary_count'],
  GROWTH:     ['cagr', 'market_size', 'yoy_growth', 'volume'],
  DEMAND:     ['import_volume', 'export_volume', 'yoy_change', 'trade_deficit'],
  EARNINGS:   ['revenue', 'ebitda', 'pat', 'margin'],
  RESULTS:    ['revenue', 'ebitda', 'pat', 'eps'],
  REGULATION: ['penalty_amount', 'entities_affected', 'compliance_days'],
  MERGER:     ['deal_value', 'stake_pct', 'premium_pct'],
  SUPPLY:     ['production_volume', 'capacity_utilization', 'inventory_days', 'price_per_unit'],
  MACRO:      ['inflation_rate', 'gdp_growth', 'iip_growth', 'repo_rate'],
  OTHER:      [],
};

// ─── Chip input ──────────────────────────────────────────────────────────────
function ChipInput({ label, hint, values, onChange, placeholder }) {
  const [input, setInput] = useState('');
  const add = () => {
    const t = input.trim();
    if (t && !values.includes(t)) onChange([...values, t]);
    setInput('');
  };
  return (
    <div>
      <Label>{label}</Label>
      {hint && <p className="text-xs text-slate-400 mt-0.5 mb-1">{hint}</p>}
      <div className="flex gap-2 mt-1">
        <Input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={placeholder} className="flex-1" />
        <Button type="button" variant="outline" size="sm" onClick={add} className="shrink-0">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {values.map(v => (
            <span key={v} className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-1 rounded-full">
              {v}
              <button type="button" onClick={() => onChange(values.filter(x => x !== v))} className="hover:text-emerald-900"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Metrics builder ─────────────────────────────────────────────────────────
function MetricsBuilder({ metrics, onChange, category }) {
  const suggestions = METRIC_TYPE_SUGGESTIONS[category] ?? [];

  const addMetric = (typeVal = '') => {
    const key = `metric_${Date.now()}`;
    onChange({ ...metrics, [key]: { type: typeVal, value: '', unit: '', period: '' } });
  };
  const update = (key, field, val) => onChange({ ...metrics, [key]: { ...metrics[key], [field]: val } });
  const remove = (key) => { const m = { ...metrics }; delete m[key]; onChange(m); };

  return (
    <div className="space-y-4">
      {suggestions.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 mb-2">Quick add for <span className="font-semibold">{category}</span>:</p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map(s => {
              const added = Object.values(metrics).some(m => m.type === s);
              return (
                <button key={s} type="button" onClick={() => !added && addMetric(s)} disabled={added}
                  className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${added ? 'bg-emerald-100 text-emerald-400 border-emerald-200 cursor-default' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400 hover:text-emerald-700'}`}>
                  + {s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {Object.keys(metrics).length > 0 && (
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
            <div className="col-span-3">Type</div>
            <div className="col-span-3">Value</div>
            <div className="col-span-2">Unit</div>
            <div className="col-span-3">Period</div>
            <div className="col-span-1"></div>
          </div>
          {Object.entries(metrics).map(([key, m]) => (
            <div key={key} className="grid grid-cols-12 gap-2 items-center bg-slate-50 rounded-lg p-2 border border-slate-100">
              <div className="col-span-3">
                <Input value={m.type} onChange={e => update(key, 'type', e.target.value)} placeholder="e.g. cagr" className="h-8 text-sm font-mono" />
              </div>
              <div className="col-span-3">
                <Input type="number" step="any" value={m.value} onChange={e => update(key, 'value', e.target.value)} placeholder="15.2" className="h-8 text-sm" />
              </div>
              <div className="col-span-2">
                <Input value={m.unit} onChange={e => update(key, 'unit', e.target.value)} placeholder="%, Cr" className="h-8 text-sm" />
              </div>
              <div className="col-span-3">
                <Input value={m.period} onChange={e => update(key, 'period', e.target.value)} placeholder="FY26, Q3" className="h-8 text-sm" />
              </div>
              <div className="col-span-1 flex justify-center">
                <button type="button" onClick={() => remove(key)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button type="button" variant="outline" size="sm" onClick={() => addMetric()}
        className="border-dashed border-slate-300 text-slate-500 hover:border-emerald-400 hover:text-emerald-700">
        <Plus className="w-4 h-4 mr-1" /> Add Metric
      </Button>
    </div>
  );
}

// ─── Main form ───────────────────────────────────────────────────────────────
const empty = {
  title: '', content: '', summary: '', source: '', url: '',
  published_at: new Date().toISOString().slice(0, 16),
  category: '', sentiment: '', impact: '',
  basic_ind_codes: [], tags: [], entities: [], metrics: {},
};

export default function CreateMarketUpdate() {
  const navigate = useNavigate();
  const { mutate, isPending } = useCreateMarketUpdate();
  const [form, setForm] = useState({ ...empty });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [showIndPicker, setShowIndPicker] = useState(false);

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: false }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = true;
    if (!form.category) e.category = true;
    if (!form.published_at) e.published_at = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) { setApiError('Please fill in the required fields.'); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    setApiError(null);

    const cleanMetrics = {};
    Object.values(form.metrics).forEach(m => {
      if (m.type && m.value !== '') {
        cleanMetrics[m.type] = { value: parseFloat(m.value), unit: m.unit || null, period: m.period || null };
      }
    });

    mutate({
      title: form.title, content: form.content || null, summary: form.summary || null,
      source: form.source || null, url: form.url || null,
      published_at: new Date(form.published_at).toISOString(),
      category: form.category, sentiment: form.sentiment || null, impact: form.impact || null,
      basic_ind_codes: form.basic_ind_codes, tags: form.tags, entities: form.entities,
      metrics: cleanMetrics,
    }, {
      onSuccess: () => navigate('/market-updates'),
      onError: (err) => setApiError('Failed: ' + (err.response?.data?.detail || err.message)),
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-24">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Add Market Update</h1>
        <p className="text-slate-500 mt-1">Capture macro signals, policy news, and product-level developments.</p>
      </div>

      {apiError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
          <p className="text-red-700 font-medium">{apiError}</p>
        </div>
      )}

      {/* Section 1 — Core */}
      <Card className="border-emerald-100 shadow-sm">
        <CardHeader className="bg-emerald-50/50 rounded-t-xl border-b border-emerald-50 pb-4">
          <CardTitle className="text-emerald-800 flex items-center">
            <span className="bg-emerald-600 text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm mr-2">1</span>
            Core Details
          </CardTitle>
          <CardDescription>The product/topic, the news, and when it happened</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div>
            <Label>Product / Topic <span className="text-red-500">*</span> <span className="text-slate-400 font-normal text-xs">— what is this about?</span></Label>
            <Input value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="e.g. CCTV, PLI Scheme, Inflation, Glass, Crude Oil"
              className="text-lg py-5 font-medium" error={errors.title} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category <span className="text-red-500">*</span></Label>
              <Select value={form.category} onChange={e => set('category', e.target.value)} error={errors.category}>
                <option value="">Select category...</option>
                {MARKET_UPDATE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </Select>
              {form.category && (
                <div className="flex items-start gap-2 mt-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg text-xs text-emerald-700 leading-relaxed">
                  <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-400" />
                  <span>{CATEGORY_SUMMARIES[form.category]}</span>
                </div>
              )}
            </div>
            <div>
              <Label>Published At <span className="text-red-500">*</span></Label>
              <Input type="datetime-local" value={form.published_at} onChange={e => set('published_at', e.target.value)} error={errors.published_at} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Sentiment</Label>
              <Select value={form.sentiment} onChange={e => set('sentiment', e.target.value)}>
                <option value="">Select...</option>
                <option value="positive">Positive</option>
                <option value="negative">Negative</option>
                <option value="neutral">Neutral</option>
              </Select>
            </div>
            <div>
              <Label>Impact</Label>
              <Select value={form.impact} onChange={e => set('impact', e.target.value)}>
                <option value="">Select...</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </Select>
            </div>
          </div>

          <div>
            <Label>Summary <span className="text-slate-400 font-normal text-xs">— 1–2 line takeaway</span></Label>
            <Input value={form.summary} onChange={e => set('summary', e.target.value)}
              placeholder="e.g. CCTV market growing at 15% CAGR due to govt push" />
          </div>

          <div>
            <Label>Content <span className="text-slate-400 font-normal text-xs">— the full news / context</span></Label>
            <textarea value={form.content} onChange={e => set('content', e.target.value)}
              placeholder="Detailed news, context, implications, data points..."
              rows={4}
              className="w-full mt-1 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent resize-none leading-relaxed" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Source <span className="text-slate-400 font-normal text-xs">(publication)</span></Label>
              <Input value={form.source} onChange={e => set('source', e.target.value)} placeholder="e.g. Ministry of Finance, Reuters" />
            </div>
            <div>
              <Label>Source URL</Label>
              <Input value={form.url} onChange={e => set('url', e.target.value)} placeholder="https://..." className="text-emerald-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2 — Classification */}
      <Card className="border-emerald-100 shadow-sm">
        <CardHeader className="bg-emerald-50/50 rounded-t-xl border-b border-emerald-50 pb-4">
          <CardTitle className="text-emerald-800 flex items-center">
            <span className="bg-emerald-600 text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm mr-2">2</span>
            Classification
          </CardTitle>
          <CardDescription>Entities involved, tags, and industry codes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <ChipInput label="Entities"
            hint="WHO or WHAT is directly involved — companies, schemes, products, regulators"
            values={form.entities} onChange={v => set('entities', v)}
            placeholder="e.g. PLI Scheme, Textile, DGFT — press Enter to add" />

          <ChipInput label="Tags"
            hint="Signal keywords — use UPPER_SNAKE for consistency"
            values={form.tags} onChange={v => set('tags', v)}
            placeholder="e.g. CAGR, GOVT_SUPPORT, IMPORT_DUTY — press Enter to add" />

          {/* Industry codes with modal picker */}
          <div>
            <Label>Industry Codes</Label>
            <p className="text-xs text-slate-400 mt-0.5 mb-2">Select from Macro Sector → Sector → Industry → Basic Industry hierarchy</p>
            <Button type="button" variant="outline" onClick={() => setShowIndPicker(true)}
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400">
              <Building2 className="w-4 h-4 mr-2" />
              {form.basic_ind_codes.length === 0 ? 'Pick Industry Codes' : `${form.basic_ind_codes.length} code(s) selected — edit`}
            </Button>
            {form.basic_ind_codes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.basic_ind_codes.map(code => (
                  <span key={code} className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-1 rounded-full font-mono">
                    {code}
                    <button type="button" onClick={() => set('basic_ind_codes', form.basic_ind_codes.filter(c => c !== code))} className="hover:text-emerald-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 3 — Metrics */}
      <Card className="border-emerald-100 shadow-sm">
        <CardHeader className="bg-emerald-50/50 rounded-t-xl border-b border-emerald-50 pb-4">
          <CardTitle className="text-emerald-800 flex items-center">
            <span className="bg-emerald-600 text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm mr-2">3</span>
            Metrics
          </CardTitle>
          <CardDescription>Each metric has a type, value, unit, and period</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <MetricsBuilder metrics={form.metrics} onChange={m => set('metrics', m)} category={form.category} />
          <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-500 leading-relaxed">
            <span className="font-semibold text-slate-600">Example: </span>
            type: <code className="bg-slate-100 px-1 rounded">cagr</code> · value: <code className="bg-slate-100 px-1 rounded">15</code> · unit: <code className="bg-slate-100 px-1 rounded">%</code> · period: <code className="bg-slate-100 px-1 rounded">FY26</code>
            &nbsp;→ <code className="bg-slate-100 px-1 rounded">{`{"cagr": {"value": 15, "unit": "%", "period": "FY26"}}`}</code>
          </div>
        </CardContent>
      </Card>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur border-t border-slate-200 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-20">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <Button variant="ghost" className="text-slate-500" onClick={() => navigate('/market-updates')}>Cancel</Button>
          <Button size="lg" onClick={handleSubmit} disabled={isPending}
            className="min-w-[160px] shadow-lg shadow-emerald-500/30 bg-emerald-600 hover:bg-emerald-700 text-white border-none">
            {isPending ? 'Publishing...' : <><Send className="w-4 h-4 mr-2" /> Publish Update</>}
          </Button>
        </div>
      </div>

      {/* Industry picker modal */}
      {showIndPicker && (
        <IndustryPickerModal
          selected={form.basic_ind_codes}
          onChange={v => set('basic_ind_codes', v)}
          onClose={() => setShowIndPicker(false)}
        />
      )}
    </div>
  );
}
