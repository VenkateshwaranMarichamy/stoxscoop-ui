import React from 'react';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Label } from './ui/Label';

export function DynamicEventFields({ eventType, event, onChange }) {
  const handleChange = (field, value, detailKey) => {
    if (detailKey) {
      onChange({
        ...event,
        [detailKey]: {
          ...(event[detailKey] || {}),
          [field]: value
        }
      });
    } else {
      onChange({
        ...event,
        [field]: value
      });
    }
  };

  const getDetailValue = (detailKey, field) => {
    return event[detailKey]?.[field] || '';
  };

  switch (eventType) {
    case 'STAKE_TRANSACTION':
      return (
        <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-lg border border-slate-100">
          <div>
            <Label>Investor Name <span className="text-red-500">*</span></Label>
            <Input 
              value={getDetailValue('stake_transaction_details', 'investor_name')} 
              onChange={e => handleChange('investor_name', e.target.value, 'stake_transaction_details')} 
              placeholder="e.g. Warren Buffett" 
            />
          </div>
          <div>
            <Label>Transaction Type <span className="text-red-500">*</span></Label>
            <Select 
              value={getDetailValue('stake_transaction_details', 'transaction_type')} 
              onChange={e => handleChange('transaction_type', e.target.value, 'stake_transaction_details')}
            >
              <option value="">Select...</option>
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </Select>
          </div>
          <div>
            <Label>Stake %</Label>
            <Input 
              type="number" 
              step="0.01" 
              value={getDetailValue('stake_transaction_details', 'stake_percentage')} 
              onChange={e => handleChange('stake_percentage', parseFloat(e.target.value), 'stake_transaction_details')} 
            />
          </div>
          <div>
            <Label>Value (Crores)</Label>
            <Input 
              type="number" 
              value={getDetailValue('stake_transaction_details', 'transaction_value')} 
              onChange={e => handleChange('transaction_value', parseFloat(e.target.value), 'stake_transaction_details')} 
            />
          </div>
        </div>
      );
    
    case 'CONTRACT':
      return (
        <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-lg border border-slate-100">
          <div className="col-span-2">
            <Label>Contract Type <span className="text-red-500">*</span></Label>
            <Select 
              value={getDetailValue('contract_details', 'contract_type')}
              onChange={e => handleChange('contract_type', e.target.value, 'contract_details')}
            >
              <option value="">Select...</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="MOU">MOU</option>
              <option value="STRATEGIC_PARTNERSHIP">STRATEGIC_PARTNERSHIP</option>
            </Select>
          </div>
          <div>
            <Label>Client Name <span className="text-red-500">*</span></Label>
            <Input 
              value={getDetailValue('contract_details', 'client_name')} 
              onChange={e => handleChange('client_name', e.target.value, 'contract_details')} 
            />
          </div>
          <div>
            <Label>Contract Value</Label>
            <Input 
              type="number" 
              value={getDetailValue('contract_details', 'contract_value')} 
              onChange={e => handleChange('contract_value', parseFloat(e.target.value), 'contract_details')} 
            />
          </div>
          <div>
            <Label>Duration (Years)</Label>
            <Input 
              type="number" 
              value={getDetailValue('contract_details', 'duration_years')} 
              onChange={e => handleChange('duration_years', parseInt(e.target.value, 10), 'contract_details')} 
            />
          </div>
          <div className="col-span-2">
            <Label>Description</Label>
            <Input 
              value={getDetailValue('contract_details', 'description')} 
              onChange={e => handleChange('description', e.target.value, 'contract_details')} 
            />
          </div>
        </div>
      );
      
    // Default or unhandled complex types just return empty to allow submission of base event
    default:
      if (['BUYBACK', 'ACQUISITION', 'PLEDGE', 'INSIDER_TRADING', 'SEBI_ACTION', 'FII_DII', 'MUTUAL_FUND', 'CREDIT_RATING', 'AUDITOR_RESIGNATION', 'BOARD_CHANGE'].includes(eventType)) {
         return <div className="p-3 bg-amber-50 text-amber-800 rounded-md text-sm">Extended details specific to {eventType.replace('_', ' ')} are skipped in MVP but supported by API.</div>;
      }
      return null;
  }
}
