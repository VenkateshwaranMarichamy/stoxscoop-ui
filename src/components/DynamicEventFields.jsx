import React from 'react';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Label } from './ui/Label';

export function DynamicEventFields({ eventType, event, onChange }) {
  const subtype = event.event_subtype;

  if (!subtype) return null;

  const handleChange = (field, value) => {
    onChange({
      ...event,
      detail: {
        ...(event.detail || {}),
        [field]: value
      }
    });
  };

  const getVal = (field) => event.detail?.[field] ?? '';

  const renderField = (config) => {
    const isCr = (config.name.includes('amount') && config.name !== 'amount_per_share') || config.name.includes('value') || config.name.includes('size') || ['revenue', 'ebitda', 'pat'].includes(config.name);
    const labelExt = isCr && !config.label.includes('(Cr)') && !config.label.includes('Crores') ? ' (Cr)' : '';
    
    return (
      <div key={config.name} className={config.fullWidth ? "col-span-2" : ""}>
        <Label>
          {config.label}{labelExt} {config.req && <span className="text-red-500">*</span>}
        </Label>
        {config.type === 'select' ? (
          <Select 
             value={getVal(config.name)} 
             onChange={e => handleChange(config.name, e.target.value)}
          >
            <option value="">Select...</option>
            {config.options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
        ) : (
          <Input
             type={config.type || 'text'}
             step={config.step}
             maxLength={config.maxLength}
             value={getVal(config.name)}
             onChange={e => {
                let val = e.target.value;
                if (config.type === 'number') val = val === '' ? '' : parseFloat(val);
                if (config.name === 'currency') val = val.toUpperCase().slice(0, 3);
                handleChange(config.name, val);
             }}
             placeholder={config.placeholder || ''}
          />
        )}
      </div>
    );
  };

  let fields = [];

  // Helper arrays for commonly used configs
  const F_AMOUNT_PER_SHARE = { name: 'amount_per_share', label: 'Amount Per Share', type: 'number', step: '0.01', req: true };
  const F_RATIO = { name: 'ratio', label: 'Ratio (e.g. 1:2)', req: true };
  const F_OFFER_PRICE = { name: 'offer_price', label: 'Offer Price', type: 'number', step: '0.01', req: true };
  const F_TOTAL_SIZE = { name: 'total_size', label: 'Total Size (Crores)', type: 'number', req: true };
  const F_CURRENCY = { name: 'currency', label: 'Currency', type: 'text', maxLength: 3, placeholder: 'INR' };
  const F_EFF_DATE = { name: 'effective_date', label: 'Effective Date', type: 'date' };
  const F_REC_DATE = { name: 'record_date', label: 'Record Date', type: 'date' };
  const F_DESC = { name: 'description', label: 'Description', fullWidth: true };
  const F_TARGET_CO = { name: 'target_company', label: 'Target Company', req: true };
  const F_INV_NAME = { name: 'investor_name', label: 'Investor Name', req: true };
  const F_STAKE_BEFORE = { name: 'stake_before', label: 'Stake Before %', type: 'number', step: '0.01' };
  const F_STAKE_AFTER = { name: 'stake_after', label: 'Stake After %', type: 'number', step: '0.01' };
  const F_TX_VALUE = { name: 'transaction_value', label: 'Tx Value (Crores)', type: 'number' };
  const F_PERSON_NAME = { name: 'person_name', label: 'Person Name', req: true };

  const INV_CATEGORIES = [
    {value: 'superinvestor', label: 'Superinvestor'}, {value: 'fii', label: 'FII'}, {value: 'dii', label: 'DII'},
    {value: 'hni', label: 'HNI'}, {value: 'mutual_fund', label: 'Mutual Fund'}, {value: 'insurance', label: 'Insurance'},
    {value: 'corporate_body', label: 'Corporate Body'}, {value: 'other', label: 'Other'}
  ];
  
  const TX_TYPES = [
    {value: 'buy', label: 'Buy'}, {value: 'sell', label: 'Sell'}, 
    {value: 'increase', label: 'Increase'}, {value: 'decrease', label: 'Decrease'},
    {value: 'pledge', label: 'Pledge'}, {value: 'revoke', label: 'Revoke'}
  ];

  const TX_MODES = [
    {value: 'bulk_deal', label: 'Bulk Deal'}, {value: 'block_deal', label: 'Block Deal'}, 
    {value: 'open_market', label: 'Open Market'}, {value: 'off_market', label: 'Off Market'}
  ];

  switch (eventType) {
    case 'corporate_action':
      if (subtype === 'dividend') fields = [F_AMOUNT_PER_SHARE, F_REC_DATE, F_EFF_DATE, F_CURRENCY];
      else if (subtype === 'bonus') fields = [F_RATIO, F_EFF_DATE];
      else if (subtype === 'split') fields = [F_RATIO, F_EFF_DATE, F_REC_DATE];
      else if (subtype === 'rights_issue') fields = [{...F_RATIO, req: false}, {...F_AMOUNT_PER_SHARE, req: false}, F_REC_DATE, {...F_TOTAL_SIZE, req: false}];
      else if (subtype === 'buyback') fields = [F_OFFER_PRICE, F_TOTAL_SIZE, F_EFF_DATE];
      else if (subtype === 'merger') fields = [F_TARGET_CO, {name: 'swap_ratio', label: 'Swap Ratio'}, {...F_TOTAL_SIZE, req: false}, F_DESC];
      else if (subtype === 'demerger') fields = [F_TARGET_CO, F_EFF_DATE, F_DESC];
      else if (subtype === 'open_offer') fields = [F_OFFER_PRICE, {...F_TOTAL_SIZE, req: false}, F_EFF_DATE];
      else if (subtype === 'acquisition') fields = [
        { name: 'target_company', label: 'Target Company', req: true },
        { name: 'stake_acquired_pct', label: 'Stake Acquired %', type: 'number', step: '0.01' },
        { name: 'resulting_stake_pct', label: 'Resulting Stake %', type: 'number', step: '0.01' },
        { name: 'total_size', label: 'Total Size (Cr)', type: 'number' },
        { name: 'amount_per_share', label: 'Amount Per Share', type: 'number', step: '0.01' },
        { name: 'shares_transacted', label: 'Shares Transacted (Cr)', type: 'number' },
        F_CURRENCY,
      ];
      break;

    case 'disclosure':
      if (['bulk_deal', 'block_deal'].includes(subtype)) fields = [
         {name: 'investor_category', label: 'Investor Category', type: 'select', options: INV_CATEGORIES, req: true},
         F_INV_NAME, 
         {name: 'transaction_type', label: 'Tx Type', type: 'select', options: TX_TYPES, req: true},
         {name: 'transaction_mode', label: 'Tx Mode', type: 'select', options: TX_MODES, req: true},
         {name: 'shares_transacted', label: 'Shares Transacted', type: 'number'},
         {name: 'price_per_share', label: 'Price Per Share', type: 'number', step: '0.01'},
         F_TX_VALUE,
         {name: 'exchange', label: 'Exchange'}
      ];
      else if (['fii_buy', 'fii_sell'].includes(subtype)) fields = [
         {name: 'investor_category', label: 'Investor Category', type: 'select', options: INV_CATEGORIES, req: true},
         F_INV_NAME, {name:'investor_country', label:'Country'},
         {name: 'transaction_type', label: 'Tx Type', type: 'select', options: TX_TYPES, req: true},
         F_STAKE_BEFORE, F_STAKE_AFTER, F_TX_VALUE
      ];
      else if (['dii_buy', 'dii_sell'].includes(subtype)) fields = [
         {name: 'investor_category', label: 'Investor Category', type: 'select', options: INV_CATEGORIES, req: true},
         F_INV_NAME, 
         {name: 'transaction_type', label: 'Tx Type', type: 'select', options: TX_TYPES, req: true},
         F_STAKE_BEFORE, F_STAKE_AFTER, F_TX_VALUE
      ];
      else if (['superinvestor_buy', 'superinvestor_sell'].includes(subtype)) fields = [
         {name: 'investor_category', label: 'Investor Category', type: 'select', options: INV_CATEGORIES, req: true},
         F_INV_NAME, 
         {name: 'transaction_type', label: 'Tx Type', type: 'select', options: TX_TYPES, req: true},
         F_STAKE_BEFORE, F_STAKE_AFTER, {name: 'shares_transacted', label: 'Shares Transacted', type: 'number'}, {name: 'price_per_share', label: 'Price/Share', type: 'number', step: '0.01'}
      ];
      else if (['shareholding_change', 'mutual_fund_change'].includes(subtype)) fields = [
         {name: 'investor_category', label: 'Category', type: 'select', options: INV_CATEGORIES, req: true},
         F_INV_NAME, 
         {name: 'transaction_type', label: 'Tx Type', type: 'select', options: TX_TYPES, req: true},
         F_STAKE_BEFORE, F_STAKE_AFTER
      ];
      break;

    case 'insider':
      if (['insider_buy', 'insider_sell'].includes(subtype)) fields = [
         F_PERSON_NAME, {name: 'designation', label: 'Designation'}, {name: 'relationship', label: 'Relationship'},
         {name: 'transaction_type', label: 'Tx Type', type: 'select', options: TX_TYPES, req: true},
         {name: 'shares_transacted', label: 'Shares Transacted', type: 'number'},
         {name: 'price_per_share', label: 'Price Per Share', type: 'number', step: '0.01'},
         F_STAKE_BEFORE, F_STAKE_AFTER, {name:'transaction_date', label:'Tx Date', type:'date'}, {name:'sebi_disclosure_date', label:'SEBI Date', type:'date'}
      ];
      else if (['pledge', 'pledge_release'].includes(subtype)) fields = [
         F_PERSON_NAME, {name:'relationship', label:'Relationship'}, 
         {name: 'transaction_type', label: 'Tx Type', type: 'select', options: TX_TYPES, req: true},
         {name:'pledge_percentage', label:'Pledge %', type:'number', step:'0.01', req:true}, {name:'transaction_date', label:'Tx Date', type:'date'}
      ];
      else if (['acquisition', 'creeping_acquisition'].includes(subtype)) fields = [
         F_PERSON_NAME, {name:'relationship', label:'Relationship'}, 
         {name: 'transaction_type', label: 'Tx Type', type: 'select', options: TX_TYPES, req: true},
         {name:'shares_transacted', label:'Shares Transacted', type:'number'}, {name:'price_per_share', label:'Price/Share', type:'number', step:'0.01'}, F_STAKE_BEFORE, F_STAKE_AFTER
      ];
      else if (subtype === 'esop_exercise') fields = [
         F_PERSON_NAME, {name:'designation', label:'Designation'}, 
         {name: 'transaction_type', label: 'Tx Type', type: 'select', options: TX_TYPES, req: true},
         {name:'shares_transacted', label:'Shares Transacted', type:'number'}, {name:'price_per_share', label:'Price/Share', type:'number'}, {name:'transaction_date', label:'Tx Date', type:'date'}
      ];
      break;

    case 'business':
      if (['contract', 'order_win'].includes(subtype)) fields = [
         {name: 'contract_type', label: 'Contract Type', type: 'select', options: [{label:'MOU', value:'mou'}, {label:'LOI', value:'loi'}, {label:'Confirmed', value:'confirmed'}, {label:'Partnership', value:'partnership'}], req: true},
         {name: 'client_name', label: 'Client Name', req: true}, {name: 'client_sector', label: 'Client Sector'},
         {name: 'contract_value', label: 'Contract Value (Cr)', type: 'number'}, {name: 'duration_years', label: 'Duration (Yrs)', type: 'number', step: '0.1'},
         {name: 'geography', label: 'Geography'}, {name: 'is_repeat_order', label: 'Is Repeat Order? (true/false)'}, F_DESC
      ];
      else if (subtype === 'capex') fields = [
         {name: 'capex_amount', label: 'Capex Amount (Cr)', type: 'number', req: true}, {name: 'project_name', label: 'Project Name'},
         {name: 'geography', label: 'Geography'}, {name: 'expected_completion', label: 'Expected Completion Date', type: 'date'}, F_DESC
      ];
      else if (subtype === 'jv_partnership') fields = [
         {name:'jv_partner', label:'JV Partner', req:true}, {name:'ownership_pct', label:'Ownership %', type:'number', step:'0.01'},
         {name:'contract_value', label:'Value', type:'number'}, {name:'geography', label:'Geography'}, F_DESC
      ];
      else if (['expansion', 'plant_commissioning', 'new_product'].includes(subtype)) fields = [
         {name:'project_name', label:'Project/Product Name', req:true}, {name:'geography', label:'Geography'},
         {name:'capex_amount', label:'Capex Amount', type:'number'}, {name: 'expected_completion', label: 'Expected Completion Dates', type: 'date'}, F_DESC
      ];
      else if (subtype === 'divestiture') fields = [{name:'client_name', label:'Buyer Name'}, {name:'contract_value', label:'Value (Cr)', type:'number', req:true}, F_DESC];
      break;

    case 'governance':
      if (['board_appointment', 'board_resignation'].includes(subtype)) fields = [
         F_PERSON_NAME, {name:'designation', label:'Designation', req:true}, {name:'change_type', label:'Change Type', req:true},
         {name:'effective_date', label:'Effective Date', type:'date'}, {name:'reason', label:'Reason'}
      ];
      else if (['auditor_appointment', 'auditor_resignation'].includes(subtype)) fields = [
         F_PERSON_NAME, {name:'change_type', label:'Change Type', req:true}, {name:'effective_date', label:'Effective Date', type:'date'}, {name:'reason', label:'Reason'}
      ];
      else if (['sebi_action', 'regulatory_notice'].includes(subtype)) fields = [
         {name:'regulator', label:'Regulator', req:true}, {name:'action_type', label:'Action Type', req:true}, {name:'penalty_amount', label:'Penalty Amount', type:'number'}, {name:'reason', label:'Reason', fullWidth:true}
      ];
      else if (['agm', 'egm'].includes(subtype)) fields = [
         {name:'meeting_date', label:'Meeting Date', type:'date', req:true}, {name:'agenda_summary', label:'Agenda Summary', fullWidth:true}
      ];
      break;

    case 'credit_rating':
      const AGENCIES = [{value:'crisil',label:'CRISIL'}, {value:'icra',label:'ICRA'}, {value:'care',label:'CARE'}, {value:'india_ratings',label:'India Ratings'}, {value:'fitch',label:'Fitch'}, {value:'moodys',label:'Moodys'}, {value:'sp_global',label:'S&P'}];
      fields = [
         {name:'agency', label:'Agency', type:'select', options:AGENCIES, req:true}, {name:'instrument_type', label:'Instrument'}, {name:'instrument_name', label:'Instrument Name'},
         {name:'rating_before', label:'Rating Before'}, {name:'rating_after', label:'Rating After', req:true},
         {name:'outlook_before', label:'Outlook Before'}, {name:'outlook_after', label:'Outlook After'},
         {name:'rated_amount', label:'Amount (Cr)', type:'number'}, {name:'rating_date', label:'Date', type:'date'},
         {name:'rationale', label:'Rationale', fullWidth:true}
      ];
      break;

    case 'financials':
      if (['quarterly_results', 'annual_results', 'provisional_numbers'].includes(subtype)) fields = [
         {name:'period_quarter', label:'Quarter', req:true}, {name:'period_year', label:'Year (e.g. 2026)', req:true},
         {name:'revenue', label:'Revenue', type:'number'}, {name:'ebitda', label:'EBITDA', type:'number'},
         {name:'ebitda_margin', label:'EBITDA Margin %', type:'number', step:'0.01'}, {name:'pat', label:'PAT', type:'number'},
         {name:'eps', label:'EPS', type:'number', step:'0.01'},
         {name:'beat_miss', label:'Beat/Miss', type:'select', options:[{value:'beat',label:'Beat'},{value:'miss',label:'Miss'},{value:'inline',label:'Inline'}]},
         {name:'key_highlight', label:'Key Highlight', fullWidth:true}
      ];
      else if (['guidance_upgrade', 'guidance_downgrade', 'guidance_maintained'].includes(subtype)) fields = [
         {name:'period_year', label:'Year', req:true}, {name:'guidance_revenue', label:'Revenue Guidance'},
         {name:'guidance_margin', label:'Margin Guidance'}, {name:'key_highlight', label:'Highlight', fullWidth:true}
      ];
      else if (subtype === 'restatement') fields = [
         {name:'period_quarter', label:'Quarter'}, {name:'period_year', label:'Year', req:true}, {name:'key_highlight', label:'Reason why changed', req:true, fullWidth:true}
      ];
      break;

    case 'fundraising':
      if (['qip', 'fpo', 'preferential_allotment'].includes(subtype)) fields = [
         {name:'issue_size', label:'Issue Size (Cr)', type:'number', req:true}, {name:'price_per_share', label:'Price/Share', type:'number'},
         {name:'number_of_shares', label:'# of Shares', type:'number'}, {name:'allottee_name', label:'Allottee Name'},
         {name:'allottee_category', label:'Category'}, {name:'purpose', label:'Purpose'}, {name:'open_date', label:'Open Date', type:'date'}, {name:'close_date', label:'Close Date', type:'date'}
      ];
      else if (['ncd', 'bond'].includes(subtype)) fields = [
         {name:'issue_size', label:'Size (Cr)', type:'number', req:true}, {name:'coupon_rate', label:'Coupon Rate %', type:'number', step:'0.01', req:false},
         {name:'maturity_date', label:'Maturity Date', type:'date', req:false}, {name:'tenure_years', label:'Tenure (Yrs)', type:'number'}, {name:'purpose', label:'Purpose'}
      ];
      else if (subtype === 'ipo') fields = [
         {name:'issue_size', label:'Size (Cr)', type:'number', req:true}, {name:'price_per_share', label:'Price/Share', type:'number'},
         {name:'open_date', label:'Open Date', type:'date'}, {name:'close_date', label:'Close Date', type:'date'}, {name:'subscription_times', label:'Subs. Times', type:'number', step:'0.1'}
      ];
      else if (['debt_repayment', 'rights_issue', 'private_placement'].includes(subtype)) fields = [
         {name:'issue_size', label:'Size (Cr)', type:'number', req:true}, {name:'purpose', label:'Purpose'}, {name:'allottee_name', label:'Allottee Name'}, {name:'allottee_category', label:'Category'}
      ];
      break;

    case 'legal':
      if (['court_order', 'arbitration'].includes(subtype)) fields = [
         {name:'forum', label:'Forum', req:true}, {name:'case_number', label:'Case Number'}, {name:'counterparty', label:'Counterparty'},
         {name:'outcome', label:'Outcome', type:'select', options:[{value:'favorable',label:'Favorable'},{value:'adverse',label:'Adverse'},{value:'pending',label:'Pending'},{value:'settled',label:'Settled'}]},
         {name:'order_date', label:'Date', type:'date'}, F_DESC
      ];
      else if (['tax_demand', 'penalty'].includes(subtype)) fields = [
         {name:'forum', label:'Forum', req:true}, {name:'demand_amount', label:'Demand (Cr)', type:'number', req:true},
         {name:'penalty_amount', label:'Penalty (Cr)', type:'number'}, {name:'company_stance', label:'Company Stance', req:true}, {name:'contingent_liability', label:'Contingent Liability (true/false)'}
      ];
      else if (subtype === 'ibc_filing') fields = [
         {name:'forum', label:'Forum', req:true}, {name:'counterparty', label:'Counterparty', req:true}, {name:'demand_amount', label:'Demand (Cr)', type:'number'}, {name:'order_date', label:'Date', type:'date'}, F_DESC
      ];
      else if (['notice', 'settlement'].includes(subtype)) fields = [
         {name:'forum', label:'Forum'}, {name:'counterparty', label:'Counterparty'}, {name:'outcome', label:'Outcome', req:true, type:'select', options:[{value:'favorable',label:'Favorable'},{value:'adverse',label:'Adverse'},{value:'pending',label:'Pending'},{value:'settled',label:'Settled'}]},
         {name:'order_date', label:'Date', type:'date'}, F_DESC
      ];
      break;

    default:
      fields = [];
  }

  if (fields.length === 0) {
     return <div className="p-3 bg-amber-50 text-amber-800 rounded-md text-sm">Please select a valid Event Subtype to enter detailed information.</div>;
  }

  const hasAmount = fields.some(f => f.name.includes('amount') || f.name.includes('value') || f.name.includes('size') || ['revenue', 'ebitda', 'pat', 'price_per_share', 'offer_price'].includes(f.name));
  const finalFields = [...fields];
  if (hasAmount && !finalFields.find(f => f.name === 'currency')) {
     finalFields.push(F_CURRENCY);
  }

  return (
    <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-lg border border-slate-100">
      {finalFields.map(renderField)}
    </div>
  );
}
