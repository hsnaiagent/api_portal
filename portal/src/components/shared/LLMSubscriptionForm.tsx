import { useMemo } from 'react';

import type { LLMSubscriptionFormData } from '@/types';

import { calculateLlmRoi } from '@/lib/roles';

import { domains } from '@/data/domains';



const emptyForm: LLMSubscriptionFormData = {

  use_case_name: '',

  estimated_value: '',

  admin_area: '',

  deployment_date: '',

  task_description: '',

  frequency_before: 0,

  frequency_after: 0,

  time_before_minutes: 0,

  time_after_minutes: 0,

  expected_users: 0,

  contact: '',

};



const FIELD_LABELS: Partial<Record<keyof LLMSubscriptionFormData, string>> = {
  use_case_name: 'Use case name',
  admin_area: 'Admin area',
  contact: 'Contact email',
  deployment_date: 'Deployment date',
  task_description: 'Task description',
  frequency_before: 'Frequency before',
  time_before_minutes: 'Time before',
  time_after_minutes: 'Time after',
  expected_users: 'Expected users',
  estimated_value: 'Estimated value',
};

interface LLMSubscriptionFormProps {

  value: LLMSubscriptionFormData;

  onChange: (value: LLMSubscriptionFormData) => void;

  readOnly?: boolean;

  showRoi?: boolean;

}



export function LLMSubscriptionForm({ value, onChange, readOnly = false, showRoi = true }: LLMSubscriptionFormProps) {

  const roi = useMemo(() => calculateLlmRoi(value), [value]);

  const errors = readOnly ? {} : validateLlmForm(value);

  const adminAreas = domains.filter((d) => d.domain_id !== 'dom_ai').map((d) => d.name);



  const set = <K extends keyof LLMSubscriptionFormData>(key: K, val: LLMSubscriptionFormData[K]) => {

    onChange({ ...value, [key]: val });

  };



  const inputClass = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50';



  return (

    <div className="space-y-6">

      <div className="space-y-4">

        <h3 className="font-semibold text-slate-800">Section A — Use Case Identity</h3>

        <div className="grid sm:grid-cols-2 gap-4">

          <div className="sm:col-span-2">

            <label className="block text-sm font-medium mb-1">Use Case Name</label>

            <input

              type="text"

              value={value.use_case_name}

              onChange={(e) => set('use_case_name', e.target.value)}

              disabled={readOnly}

              className={inputClass}

              placeholder="e.g. HR Report Narrative Generator"

            />

          </div>

          <div>

            <label className="block text-sm font-medium mb-1">Admin Area using this use case</label>

            <select

              value={value.admin_area}

              onChange={(e) => set('admin_area', e.target.value)}

              disabled={readOnly}

              className={inputClass}

            >

              <option value="">Select area</option>

              {adminAreas.map((area) => (

                <option key={area} value={area}>{area}</option>

              ))}

            </select>

          </div>

          <div>

            <label className="block text-sm font-medium mb-1">Contact person</label>

            <input

              type="email"

              value={value.contact}

              onChange={(e) => set('contact', e.target.value)}

              disabled={readOnly}

              className={inputClass}

              placeholder="name@example.com"

            />

          </div>

          <div>

            <label className="block text-sm font-medium mb-1">Deployment Date</label>

            <input

              type="date"

              value={value.deployment_date}

              onChange={(e) => set('deployment_date', e.target.value)}

              disabled={readOnly}

              className={inputClass}

            />

          </div>

          <div className="sm:col-span-2">

            <label className="block text-sm font-medium mb-1">Task the use case provides productivity for</label>

            <textarea

              value={value.task_description}

              onChange={(e) => set('task_description', e.target.value)}

              disabled={readOnly}

              rows={3}

              className={inputClass}

              placeholder="Describe the business task this LLM use case automates or accelerates"

            />

          </div>

        </div>

      </div>



      <div className="space-y-4">

        <h3 className="font-semibold text-slate-800">Section B — Productivity Impact</h3>

        <div className="grid sm:grid-cols-2 gap-4">

          <div>

            <label className="block text-sm font-medium mb-1">Frequency before (times/week)</label>

            <input

              type="number"

              min={0}

              value={value.frequency_before || ''}

              onChange={(e) => set('frequency_before', Number(e.target.value))}

              disabled={readOnly}

              className={inputClass}

            />

          </div>

          <div>

            <label className="block text-sm font-medium mb-1">Frequency after (times/week)</label>

            <input

              type="number"

              min={0}

              value={value.frequency_after || ''}

              onChange={(e) => set('frequency_after', Number(e.target.value))}

              disabled={readOnly}

              className={inputClass}

            />

          </div>

          <div>

            <label className="block text-sm font-medium mb-1">Time spent before (minutes)</label>

            <input

              type="number"

              min={0}

              value={value.time_before_minutes || ''}

              onChange={(e) => set('time_before_minutes', Number(e.target.value))}

              disabled={readOnly}

              className={inputClass}

            />

          </div>

          <div>

            <label className="block text-sm font-medium mb-1">Time spent after (minutes)</label>

            <input

              type="number"

              min={0}

              value={value.time_after_minutes || ''}

              onChange={(e) => set('time_after_minutes', Number(e.target.value))}

              disabled={readOnly}

              className={inputClass}

            />

          </div>

          <div>

            <label className="block text-sm font-medium mb-1">Expected number of users</label>

            <input

              type="number"

              min={1}

              value={value.expected_users || ''}

              onChange={(e) => set('expected_users', Number(e.target.value))}

              disabled={readOnly}

              className={inputClass}

            />

          </div>

          <div>

            <label className="block text-sm font-medium mb-1">Estimated Value / Cost Savings</label>

            <input

              type="text"

              value={value.estimated_value}

              onChange={(e) => set('estimated_value', e.target.value)}

              disabled={readOnly}

              className={inputClass}

              placeholder="e.g. SAR 120,000/year"

            />

          </div>

        </div>

      </div>



      {showRoi && (

        <div className="rounded-xl border border-brand-green/30 bg-brand-green-light/40 p-4 space-y-2">

          <h4 className="font-semibold text-brand-green text-sm">Live ROI Preview</h4>

          <div className="grid sm:grid-cols-2 gap-2 text-sm text-slate-700">

            <p>Time saved per use: <strong>{roi.timeSavedPerUse} min</strong></p>

            <p>Frequency reduction: <strong>{roi.frequencyReduction} times/week</strong></p>

            <p>Per-user weekly savings: <strong>{roi.perUserWeeklyMinutes} min</strong></p>

            <p>Total weekly savings ({value.expected_users || 0} users): <strong>{roi.totalWeeklyHours} hours</strong></p>

          </div>

          {value.estimated_value && (

            <p className="text-sm text-slate-600">Estimated value: <strong>{value.estimated_value}</strong></p>

          )}

        </div>

      )}

      {!readOnly && Object.keys(errors).length > 0 && (

        <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800">

          <p className="font-medium">Please complete the following:</p>

          <ul className="list-disc list-inside mt-1">

            {(Object.entries(errors) as [keyof LLMSubscriptionFormData, string][]).map(([key, msg]) => (

              <li key={key}>{FIELD_LABELS[key] ?? key}: {msg}</li>

            ))}

          </ul>

        </div>

      )}

    </div>

  );

}



const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLlmForm(form: LLMSubscriptionFormData): Partial<Record<keyof LLMSubscriptionFormData, string>> {
  const errors: Partial<Record<keyof LLMSubscriptionFormData, string>> = {};
  if (!form.use_case_name.trim()) errors.use_case_name = 'Required';
  if (!form.admin_area.trim()) errors.admin_area = 'Select an admin area';
  if (!form.contact.trim()) errors.contact = 'Required';
  else if (!EMAIL_RE.test(form.contact.trim())) errors.contact = 'Enter a valid email address';
  if (!form.deployment_date) errors.deployment_date = 'Required';
  if (!form.task_description.trim()) errors.task_description = 'Describe the task';
  if (!(form.frequency_before > 0)) errors.frequency_before = 'Must be greater than 0';
  if (!(form.time_before_minutes > 0)) errors.time_before_minutes = 'Must be greater than 0';
  if (form.time_after_minutes > form.time_before_minutes) errors.time_after_minutes = 'Must not exceed time before';
  if (!(form.expected_users > 0)) errors.expected_users = 'At least 1 user';
  if (!form.estimated_value.trim()) errors.estimated_value = 'Required';
  return errors;
}

export function isLlmFormComplete(form: LLMSubscriptionFormData) {
  return Object.keys(validateLlmForm(form)).length === 0;
}



export { emptyForm as emptyLlmForm };


