import { useMemo } from 'react';

import type { LLMSubscriptionFormData } from '@/types';
import { calculateLlmRoi } from '@/lib/roles';
import { domains } from '@/data/domains';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

export function LLMSubscriptionForm({
  value,
  onChange,
  readOnly = false,
  showRoi = true,
}: LLMSubscriptionFormProps) {
  const roi = useMemo(() => calculateLlmRoi(value), [value]);
  const errors = readOnly ? {} : validateLlmForm(value);
  const adminAreas = domains.filter((d) => d.domain_id !== 'dom_ai').map((d) => d.name);

  const set = <K extends keyof LLMSubscriptionFormData>(
    key: K,
    val: LLMSubscriptionFormData[K],
  ) => {
    onChange({ ...value, [key]: val });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Section A — Use Case Identity</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-foreground">Use Case Name</label>
            <Input
              type="text"
              value={value.use_case_name}
              onChange={(e) => set('use_case_name', e.target.value)}
              disabled={readOnly}
              placeholder="e.g. HR Report Narrative Generator"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Admin Area using this use case
            </label>
            <Select
              value={value.admin_area || undefined}
              onValueChange={(v) => v && set('admin_area', v)}
              disabled={readOnly}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select area" />
              </SelectTrigger>
              <SelectContent>
                {adminAreas.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Contact person</label>
            <Input
              type="email"
              value={value.contact}
              onChange={(e) => set('contact', e.target.value)}
              disabled={readOnly}
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Deployment Date</label>
            <Input
              type="date"
              value={value.deployment_date}
              onChange={(e) => set('deployment_date', e.target.value)}
              disabled={readOnly}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-foreground">
              Task the use case provides productivity for
            </label>
            <Textarea
              value={value.task_description}
              onChange={(e) => set('task_description', e.target.value)}
              disabled={readOnly}
              rows={3}
              placeholder="Describe the business task this LLM use case automates or accelerates"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Section B — Productivity Impact</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Frequency before (times/week)
            </label>
            <Input
              type="number"
              min={0}
              value={value.frequency_before || ''}
              onChange={(e) => set('frequency_before', Number(e.target.value))}
              disabled={readOnly}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Frequency after (times/week)
            </label>
            <Input
              type="number"
              min={0}
              value={value.frequency_after || ''}
              onChange={(e) => set('frequency_after', Number(e.target.value))}
              disabled={readOnly}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Time spent before (minutes)
            </label>
            <Input
              type="number"
              min={0}
              value={value.time_before_minutes || ''}
              onChange={(e) => set('time_before_minutes', Number(e.target.value))}
              disabled={readOnly}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Time spent after (minutes)
            </label>
            <Input
              type="number"
              min={0}
              value={value.time_after_minutes || ''}
              onChange={(e) => set('time_after_minutes', Number(e.target.value))}
              disabled={readOnly}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Expected number of users
            </label>
            <Input
              type="number"
              min={1}
              value={value.expected_users || ''}
              onChange={(e) => set('expected_users', Number(e.target.value))}
              disabled={readOnly}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Estimated Value / Cost Savings
            </label>
            <Input
              type="text"
              value={value.estimated_value}
              onChange={(e) => set('estimated_value', e.target.value)}
              disabled={readOnly}
              placeholder="e.g. SAR 120,000/year"
            />
          </div>
        </CardContent>
      </Card>

      {showRoi && (
        <div className="rounded-xl border border-brand/30 bg-brand-subtle/40 p-4 space-y-2">
          <h4 className="text-sm font-semibold text-brand">Live ROI Preview</h4>
          <div className="grid gap-2 text-sm text-foreground sm:grid-cols-2">
            <p>
              Time saved per use: <strong>{roi.timeSavedPerUse} min</strong>
            </p>
            <p>
              Frequency reduction: <strong>{roi.frequencyReduction} times/week</strong>
            </p>
            <p>
              Per-user weekly savings: <strong>{roi.perUserWeeklyMinutes} min</strong>
            </p>
            <p>
              Total weekly savings ({value.expected_users || 0} users):{' '}
              <strong>{roi.totalWeeklyHours} hours</strong>
            </p>
          </div>
          {value.estimated_value && (
            <p className="text-sm text-muted-foreground">
              Estimated value: <strong className="text-foreground">{value.estimated_value}</strong>
            </p>
          )}
        </div>
      )}

      {!readOnly && Object.keys(errors).length > 0 && (
        <div className="rounded-lg border border-status-warning/30 bg-status-warning/10 p-3 text-sm text-foreground">
          <p className="font-medium">Please complete the following:</p>
          <ul className="mt-1 list-inside list-disc">
            {(Object.entries(errors) as [keyof LLMSubscriptionFormData, string][]).map(
              ([key, msg]) => (
                <li key={key}>
                  {FIELD_LABELS[key] ?? key}: {msg}
                </li>
              ),
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLlmForm(
  form: LLMSubscriptionFormData,
): Partial<Record<keyof LLMSubscriptionFormData, string>> {
  const errors: Partial<Record<keyof LLMSubscriptionFormData, string>> = {};
  if (!form.use_case_name.trim()) errors.use_case_name = 'Required';
  if (!form.admin_area.trim()) errors.admin_area = 'Select an admin area';
  if (!form.contact.trim()) errors.contact = 'Required';
  else if (!EMAIL_RE.test(form.contact.trim())) errors.contact = 'Enter a valid email address';
  if (!form.deployment_date) errors.deployment_date = 'Required';
  if (!form.task_description.trim()) errors.task_description = 'Describe the task';
  if (!(form.frequency_before > 0)) errors.frequency_before = 'Must be greater than 0';
  if (!(form.time_before_minutes > 0)) errors.time_before_minutes = 'Must be greater than 0';
  if (form.time_after_minutes > form.time_before_minutes)
    errors.time_after_minutes = 'Must not exceed time before';
  if (!(form.expected_users > 0)) errors.expected_users = 'At least 1 user';
  if (!form.estimated_value.trim()) errors.estimated_value = 'Required';
  return errors;
}

export function isLlmFormComplete(form: LLMSubscriptionFormData) {
  return Object.keys(validateLlmForm(form)).length === 0;
}

export { emptyForm as emptyLlmForm };
