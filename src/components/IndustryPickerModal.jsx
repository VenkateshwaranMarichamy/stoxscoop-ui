import React, { useState, useMemo } from 'react';
import { useClassification } from '../hooks/useApi';
import { X, Search, Check, ChevronRight, CheckSquare } from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────────────────

function pluck(raw, codeKey, nameKey, parentKey) {
  const arr = raw?.data ?? raw ?? [];
  return arr
    .map(r => ({
      code:   r[codeKey]  ?? '',
      name:   r[nameKey]  ?? '',
      parent: parentKey ? (r[parentKey] ?? '') : undefined,
    }))
    .filter(r => r.code && r.name);
}

const TABS = ['Macro', 'Sector', 'Industry', 'Basic Industry'];

// ── Sub-components ────────────────────────────────────────────────────────────

function SelAllBtn({ active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={active ? 'Deselect all' : 'Select all'}
      className={`w-8 h-8 rounded border flex items-center justify-center shrink-0 transition-colors ${
        active
          ? 'bg-emerald-600 border-emerald-600 text-white'
          : 'border-slate-200 text-slate-400 hover:border-emerald-500 hover:text-emerald-600'
      }`}
    >
      <CheckSquare className="w-4 h-4" />
    </button>
  );
}

function DrillRow({ name, count, onSelectAll, allSelected, onDrill }) {
  return (
    <div className="flex items-center gap-2 group">
      <SelAllBtn active={allSelected} onClick={onSelectAll} />
      <button
        onClick={onDrill}
        className="flex-1 flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-colors text-left"
      >
        <span className="text-sm font-medium text-slate-700 group-hover:text-emerald-800">{name}</span>
        <div className="flex items-center gap-2">
          {count > 0 && (
            <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-1.5 py-0.5 rounded-full">
              {count}
            </span>
          )}
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" />
        </div>
      </button>
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────

export function IndustryPickerModal({ selected, onChange, onClose }) {
  const { macroSectors, sectors, industries, basicInds } = useClassification();

  const [tabIdx,  setTabIdx]  = useState(0); // 0=Macro 1=Sector 2=Industry 3=Basic
  const [search,  setSearch]  = useState('');
  // Active drill filters
  const [mesCode,    setMesCode]    = useState('');
  const [sectorCode, setSectorCode] = useState('');
  const [indCode,    setIndCode]    = useState('');

  const isLoading = macroSectors.isLoading || sectors.isLoading || industries.isLoading || basicInds.isLoading;

  // Normalised full lists (all prefetched)
  const macroList  = useMemo(() => pluck(macroSectors.data, 'mes_code',       'macro_economic_sector', null),       [macroSectors.data]);
  const sectorList = useMemo(() => pluck(sectors.data,      'sect_code',      'sector_name',           'mes_code'),  [sectors.data]);
  const indList    = useMemo(() => pluck(industries.data,   'ind_code',       'industry_name',         'sect_code'), [industries.data]);
  const basicList  = useMemo(() => pluck(basicInds.data,    'basic_ind_code', 'basic_industry_name',   'ind_code'),  [basicInds.data]);

  // Filtered lists for current tab + search
  const q = search.toLowerCase();
  const visibleMacro = useMemo(() =>
    macroList.filter(r => !q || r.name.toLowerCase().includes(q)),
    [macroList, q]);

  const visibleSectors = useMemo(() => {
    let list = mesCode ? sectorList.filter(r => r.parent === mesCode) : sectorList;
    return q ? list.filter(r => r.name.toLowerCase().includes(q)) : list;
  }, [sectorList, mesCode, q]);

  const visibleIndustries = useMemo(() => {
    let list = sectorCode ? indList.filter(r => r.parent === sectorCode) : indList;
    return q ? list.filter(r => r.name.toLowerCase().includes(q)) : list;
  }, [indList, sectorCode, q]);

  const visibleBasic = useMemo(() => {
    let list = indCode ? basicList.filter(r => r.parent === indCode) : basicList;
    return q ? list.filter(r => r.name.toLowerCase().includes(q)) : list;
  }, [basicList, indCode, q]);

  // ── Selection logic ────────────────────────────────────────────────────────

  const toggle = (code) =>
    onChange(selected.includes(code) ? selected.filter(c => c !== code) : [...selected, code]);

  const applyGroup = (codes) => {
    const allSel = codes.length > 0 && codes.every(c => selected.includes(c));
    onChange(allSel
      ? selected.filter(c => !codes.includes(c))
      : [...new Set([...selected, ...codes])]);
  };

  // Get all basic_ind_codes under a given ind_code
  const basicsForInd = (ic) => basicList.filter(b => b.parent === ic).map(b => b.code);

  // Get all basic_ind_codes under a given sector_code
  const basicsForSector = (sc) => {
    const inds = indList.filter(i => i.parent === sc).map(i => i.code);
    return basicList.filter(b => inds.includes(b.parent)).map(b => b.code);
  };

  // Get all basic_ind_codes under a given mes_code
  const basicsForMacro = (mc) => {
    const sects = sectorList.filter(s => s.parent === mc).map(s => s.code);
    const inds  = indList.filter(i => sects.includes(i.parent)).map(i => i.code);
    return basicList.filter(b => inds.includes(b.parent)).map(b => b.code);
  };

  const countSel = (codes) => codes.filter(c => selected.includes(c)).length;
  const allSel   = (codes) => codes.length > 0 && codes.every(c => selected.includes(c));

  // ── Navigation ─────────────────────────────────────────────────────────────

  const drillToSector = (mc) => { setMesCode(mc); setSectorCode(''); setIndCode(''); setTabIdx(1); setSearch(''); };
  const drillToInd    = (sc) => { setSectorCode(sc); setIndCode(''); setTabIdx(2); setSearch(''); };
  const drillToBasic  = (ic) => { setIndCode(ic); setTabIdx(3); setSearch(''); };

  // Breadcrumb labels
  const macroName  = macroList.find(m => m.code === mesCode)?.name ?? '';
  const sectorName = sectorList.find(s => s.code === sectorCode)?.name ?? '';
  const indName    = indList.find(i => i.code === indCode)?.name ?? '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[82vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Select Basic Industries</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select at any level to auto-select all basic industries beneath it
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-4">
          {TABS.map((label, i) => (
            <button
              key={label}
              onClick={() => { setTabIdx(i); setSearch(''); }}
              className={`py-3 px-3 text-sm font-semibold border-b-2 transition-colors -mb-px ${
                tabIdx === i
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
          {/* Selected count badge */}
          {selected.length > 0 && (
            <div className="ml-auto flex items-center pb-1">
              <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2.5 py-1 rounded-full">
                {selected.length} selected
              </span>
            </div>
          )}
        </div>

        {/* Breadcrumb */}
        {(macroName || sectorName || indName) && (
          <div className="flex items-center gap-1.5 px-6 py-2 bg-slate-50 border-b border-slate-100 text-xs text-slate-500 flex-wrap">
            {macroName && (
              <button onClick={() => { setMesCode(''); setSectorCode(''); setIndCode(''); setTabIdx(0); }}
                className="text-emerald-700 font-medium hover:underline">{macroName}</button>
            )}
            {sectorName && <><span>›</span><button onClick={() => { setSectorCode(''); setIndCode(''); setTabIdx(1); }}
              className="text-emerald-700 font-medium hover:underline">{sectorName}</button></>}
            {indName && <><span>›</span><button onClick={() => { setIndCode(''); setTabIdx(2); }}
              className="text-emerald-700 font-medium hover:underline">{indName}</button></>}
          </div>
        )}

        {/* Search */}
        <div className="px-6 py-3 border-b border-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${TABS[tabIdx]}...`}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-6 py-3 space-y-0.5">
          {isLoading ? (
            <div className="flex justify-center items-center py-12 text-slate-400">
              <div className="w-5 h-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mr-2" />
              Loading classification data...
            </div>
          ) : tabIdx === 0 ? (
            // ── Macro ──
            visibleMacro.length === 0
              ? <Empty />
              : visibleMacro.map(item => {
                  const codes = basicsForMacro(item.code);
                  return (
                    <DrillRow
                      key={item.code}
                      name={item.name}
                      count={countSel(codes)}
                      allSelected={allSel(codes)}
                      onSelectAll={() => applyGroup(codes)}
                      onDrill={() => drillToSector(item.code)}
                    />
                  );
                })
          ) : tabIdx === 1 ? (
            // ── Sector ──
            visibleSectors.length === 0
              ? <Empty />
              : visibleSectors.map(item => {
                  const codes = basicsForSector(item.code);
                  return (
                    <DrillRow
                      key={item.code}
                      name={item.name}
                      count={countSel(codes)}
                      allSelected={allSel(codes)}
                      onSelectAll={() => applyGroup(codes)}
                      onDrill={() => drillToInd(item.code)}
                    />
                  );
                })
          ) : tabIdx === 2 ? (
            // ── Industry ──
            visibleIndustries.length === 0
              ? <Empty />
              : visibleIndustries.map(item => {
                  const codes = basicsForInd(item.code);
                  return (
                    <DrillRow
                      key={item.code}
                      name={item.name}
                      count={countSel(codes)}
                      allSelected={allSel(codes)}
                      onSelectAll={() => applyGroup(codes)}
                      onDrill={() => drillToBasic(item.code)}
                    />
                  );
                })
          ) : (
            // ── Basic Industry — individual checkboxes ──
            visibleBasic.length === 0
              ? <Empty />
              : visibleBasic.map(item => {
                  const isSel = selected.includes(item.code);
                  return (
                    <button
                      key={item.code}
                      onClick={() => toggle(item.code)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors group ${
                        isSel ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-colors ${
                        isSel ? 'bg-emerald-600 border-emerald-600' : 'border-slate-300 group-hover:border-emerald-400'
                      }`}>
                        {isSel && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </div>
                      <span className={`text-sm font-medium ${isSel ? 'text-emerald-800' : 'text-slate-700'}`}>
                        {item.name}
                      </span>
                    </button>
                  );
                })
          )}
        </div>

        {/* Footer — selected chips */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-b-2xl">
          <div className="flex flex-wrap gap-1.5 flex-1 mr-4 max-h-16 overflow-y-auto">
            {selected.length === 0
              ? <span className="text-xs text-slate-400">No industries selected</span>
              : selected.map(code => {
                  const name = basicList.find(b => b.code === code)?.name ?? code;
                  return (
                    <span key={code} className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-0.5 rounded-full">
                      {name}
                      <button type="button" onClick={() => toggle(code)} className="hover:text-emerald-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })
            }
          </div>
          <button
            onClick={onClose}
            className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            Done ({selected.length})
          </button>
        </div>

      </div>
    </div>
  );
}

function Empty() {
  return <p className="text-center text-slate-400 py-12 text-sm">No results found</p>;
}
