'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Select } from '@/app/components/ui/select';
import { Alert } from '@/app/components/ui/alert';
import { getCampaigns, getCampaign } from '@/lib/api';
import { logger } from '@/lib/utils';
import { requestPlacementAction, type RequestPlacementFormState } from '../actions';
import { toast } from '@/app/components/ui/toast';
import type { AdSlot, Campaign } from '@/lib/types';

interface BookingRequestModalProps {
  adSlot: AdSlot;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  sponsorId: string;
}

interface Creative {
  id: string;
  name: string;
  type: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} className="w-full" disabled={pending}>
      {pending ? 'Submitting request…' : 'Send request'}
    </Button>
  );
}

export function BookingRequestModal({
  adSlot,
  open,
  onOpenChange,
  onSuccess,
  sponsorId,
}: BookingRequestModalProps) {
  const [campaigns, setCampaigns] = useState<Array<{ id: string; name: string }>>([]);
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [campaignsError, setCampaignsError] = useState<string | null>(null);
  const [requestState, setRequestState] = useState<RequestPlacementFormState | null>(null);

  const [formValues, setFormValues] = useState({
    campaignId: '',
    creativeId: '',
    pricingModelValue: '',
    pricingModel: 'CPM',
    startDate: '',
    endDate: '',
    message: '',
  });

  const toastShownRef = useRef(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setFormValues({
        campaignId: '',
        creativeId: '',
        pricingModelValue: '',
        pricingModel: 'CPM',
        startDate: '',
        endDate: '',
        message: '',
      });
      setRequestState(null);
      setCreatives([]);
      toastShownRef.current = false;
    }
  }, [open]);

  // ... (keeping other effects unchanged)

  // Load campaigns
  useEffect(() => {
    if (!open || !sponsorId) return;

    let alive = true;
    setCampaignsLoading(true);
    setCampaignsError(null);

    getCampaigns(sponsorId)
      .then((items) => {
        if (!alive) return;
        const mapped = Array.isArray(items)
          ? items.map((c) => ({ id: String(c.id), name: String(c.name) }))
          : [];
        setCampaigns(mapped);
      })
      .catch((err) => {
        logger.error('Failed to load campaigns:', err);
        if (!alive) return;
        setCampaignsError('Failed to load campaigns');
      })
      .finally(() => {
        if (!alive) return;
        setCampaignsLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [open, sponsorId]);

  // Load creatives and set default dates for selected campaign
  useEffect(() => {
    if (!formValues.campaignId) {
      setCreatives([]);
      setSelectedCampaign(null);
      setFormValues((prev) => ({ ...prev, creativeId: '', startDate: '', endDate: '' }));
      return;
    }

    let alive = true;
    getCampaign(formValues.campaignId)
      .then((campaign) => {
        if (!alive) return;
        setSelectedCampaign(campaign);

        const cr = Array.isArray(campaign?.creatives)
          ? campaign.creatives.map((c) => ({
            id: String(c.id),
            name: String(c.name),
            type: String(c.type),
          }))
          : [];
        setCreatives(cr);

        // Set default dates based on campaign dates
        if (campaign.startDate && campaign.endDate) {
          const campaignStart = new Date(campaign.startDate);
          const campaignEnd = new Date(campaign.endDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Reset time to start of day

          // If today is after campaign start date, use today as start date
          const defaultStart = today > campaignStart ? today : campaignStart;
          const defaultEnd = campaignEnd;

          // Format dates as YYYY-MM-DD for input[type="date"]
          const formatDate = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          };

          setFormValues((prev) => ({
            ...prev,
            startDate: formatDate(defaultStart),
            endDate: formatDate(defaultEnd),
          }));
        }
      })
      .catch((err) => {
        logger.error('Failed to load campaign:', err);
        if (!alive) return;
        setCreatives([]);
        setSelectedCampaign(null);
      });

    return () => {
      alive = false;
    };
  }, [formValues.campaignId]);

  // Set default pricing model value based on selected campaign's rates
  useEffect(() => {
    if (!selectedCampaign) return;

    // Auto-fill pricing model value based on campaign's rates
    if (formValues.pricingModel === 'CPM' && selectedCampaign.cpmRate) {
      setFormValues((prev) => ({
        ...prev,
        pricingModelValue: String(selectedCampaign.cpmRate),
      }));
    } else if (formValues.pricingModel === 'CPC' && selectedCampaign.cpcRate) {
      setFormValues((prev) => ({
        ...prev,
        pricingModelValue: String(selectedCampaign.cpcRate),
      }));
    }
    // For CPA and FLAT_RATE, leave empty as campaigns don't have default rates for these
  }, [formValues.pricingModel, selectedCampaign]);

  // Preserve values on server-side validation errors
  useEffect(() => {
    const v = requestState?.values;
    if (!v) return;
    setFormValues((prev) => ({
      ...prev,
      campaignId: v.campaignId ?? prev.campaignId,
      creativeId: v.creativeId ?? prev.creativeId,
      pricingModelValue: v.pricingModelValue ?? prev.pricingModelValue,
      pricingModel: v.pricingModel ?? prev.pricingModel,
      startDate: v.startDate ?? prev.startDate,
      endDate: v.endDate ?? prev.endDate,
      message: v.message ?? prev.message,
    }));
  }, [requestState?.values]);

  // Close modal and call onSuccess on successful submission
  useEffect(() => {
    if (requestState?.success) {
      if (!toastShownRef.current) {
        toast({
          title: 'Request sent',
          description: 'Your placement request has been sent to the publisher.',
          variant: 'success',
        });
        toastShownRef.current = true;
      }
      onSuccess?.();
      onOpenChange(false);
    } else {
      toastShownRef.current = false;
    }
  }, [requestState, onSuccess, onOpenChange]);

  const handleSubmit = async (formData: FormData) => {
    formData.append('adSlotId', adSlot.id);
    const result = await requestPlacementAction(requestState, formData);
    setRequestState(result);
  };



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#F9FAFB] dark:bg-[--color-background]">
        <DialogHeader>
          <DialogTitle>Request Placement</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-[--color-foreground]">{adSlot.name}</span> <span className="text-[--color-muted]">by</span> <span className="font-medium text-[--color-foreground]">{adSlot.publisher?.name}</span>
          </DialogDescription>
        </DialogHeader>



        {campaignsError && <Alert variant="error" className="mb-4">{campaignsError}</Alert>}

        <form action={handleSubmit} className="space-y-4">
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="campaignId" className="block text-sm font-medium text-[--color-foreground]">
                Campaign <span className="text-[--color-error]">*</span>
              </label>
              {formValues.campaignId && (
                <Link
                  href={`/campaigns/${formValues.campaignId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[--color-primary] hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Campaign →
                </Link>
              )}
            </div>
            <Select
              id="campaignId"
              name="campaignId"
              required
              value={formValues.campaignId}
              disabled={campaignsLoading}
              onChange={(e) => setFormValues((v) => ({ ...v, campaignId: e.target.value, creativeId: '' }))}
            >
              <option value="" disabled>
                {campaignsLoading ? 'Loading campaigns…' : 'Select a campaign'}
              </option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            {requestState?.fieldErrors?.campaignId && (
              <p className="mt-1 text-sm text-[--color-error]">{requestState.fieldErrors.campaignId}</p>
            )}
          </div>

          <div>
            <label htmlFor="creativeId" className="mb-1 block text-sm font-medium text-[--color-foreground]">
              Creative <span className="text-[--color-error]">*</span>
            </label>
            <Select
              id="creativeId"
              name="creativeId"
              required
              value={formValues.creativeId}
              disabled={!formValues.campaignId || creatives.length === 0}
              onChange={(e) => setFormValues((v) => ({ ...v, creativeId: e.target.value }))}
            >
              <option value="" disabled>
                {formValues.campaignId ? (creatives.length === 0 ? 'No creatives available' : 'Select a creative') : 'Select a campaign first'}
              </option>
              {creatives.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type})
                </option>
              ))}
            </Select>
            {requestState?.fieldErrors?.creativeId && (
              <p className="mt-1 text-sm text-[--color-error]">{requestState.fieldErrors.creativeId}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="startDate" className="mb-1 block text-sm font-medium text-[--color-foreground]">
                Start date <span className="text-[--color-error]">*</span>
              </label>
              <Input
                id="startDate"
                type="date"
                name="startDate"
                required
                value={formValues.startDate}
                min={selectedCampaign ? (() => {
                  const campaignStart = new Date(selectedCampaign.startDate);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const minDate = today > campaignStart ? today : campaignStart;
                  return minDate.toISOString().split('T')[0];
                })() : undefined}
                max={selectedCampaign ? new Date(selectedCampaign.endDate).toISOString().split('T')[0] : undefined}
                onChange={(e) => {
                  const newStart = e.target.value;
                  setFormValues((v) => {
                    // If new start date is after end date, adjust end date
                    if (newStart && v.endDate && newStart > v.endDate) {
                      return { ...v, startDate: newStart, endDate: newStart };
                    }
                    return { ...v, startDate: newStart };
                  });
                }}
              />
              {selectedCampaign && (
                <p className="mt-1 text-xs text-[--color-muted]">
                  Campaign: {new Date(selectedCampaign.startDate).toLocaleDateString()} - {new Date(selectedCampaign.endDate).toLocaleDateString()}
                </p>
              )}
              {requestState?.fieldErrors?.startDate && (
                <p className="mt-1 text-sm text-[--color-error]">{requestState.fieldErrors.startDate}</p>
              )}
            </div>

            <div>
              <label htmlFor="endDate" className="mb-1 block text-sm font-medium text-[--color-foreground]">
                End date <span className="text-[--color-error]">*</span>
              </label>
              <Input
                id="endDate"
                type="date"
                name="endDate"
                required
                value={formValues.endDate}
                min={formValues.startDate || (selectedCampaign ? (() => {
                  const campaignStart = new Date(selectedCampaign.startDate);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const minDate = today > campaignStart ? today : campaignStart;
                  return minDate.toISOString().split('T')[0];
                })() : undefined)}
                max={selectedCampaign ? new Date(selectedCampaign.endDate).toISOString().split('T')[0] : undefined}
                onChange={(e) => setFormValues((v) => ({ ...v, endDate: e.target.value }))}
              />
              {requestState?.fieldErrors?.endDate && (
                <p className="mt-1 text-sm text-[--color-error]">{requestState.fieldErrors.endDate}</p>
              )}
            </div>
          </div>

          {/* Pricing Section */}
          <div className="rounded-lg border border-[--color-border] bg-[--color-surface] p-4">
            <h3 className="mb-3 text-sm font-semibold text-[--color-foreground]">Pricing Details</h3>

            {/* Hidden field for base price */}
            <input type="hidden" name="basePrice" value={String(adSlot.basePrice ?? 0)} />

            <div className="space-y-4">


              {/* Pricing Model Selection */}
              <div>
                <label htmlFor="pricingModel" className="mb-1 block text-sm font-medium text-[--color-foreground]">
                  Pricing model <span className="text-[--color-error]">*</span>
                </label>
                <Select
                  id="pricingModel"
                  name="pricingModel"
                  value={formValues.pricingModel}
                  onChange={(e) => setFormValues((v) => ({ ...v, pricingModel: e.target.value }))}
                >
                  <option value="CPM">CPM (Cost Per Mille/1000 impressions)</option>
                  <option value="CPC">CPC (Cost Per Click)</option>
                  <option value="CPA">CPA (Cost Per Acquisition)</option>
                  <option value="FLAT_RATE">Flat Rate (Fixed additional fee)</option>
                </Select>
                <p className="mt-1 text-xs text-[--color-muted]">
                  Additional payment model on top of base price
                </p>
              </div>

              {/* Pricing Model Value Input */}
              <div>
                <label htmlFor="pricingModelValue" className="mb-1 block text-sm font-medium text-[--color-foreground]">
                  {formValues.pricingModel === 'CPM' && 'CPM Rate ($)'}
                  {formValues.pricingModel === 'CPC' && 'CPC Rate ($)'}
                  {formValues.pricingModel === 'CPA' && 'CPA Rate ($)'}
                  {formValues.pricingModel === 'FLAT_RATE' && 'Flat Rate Amount ($)'}
                  <span className="text-[--color-error]"> *</span>
                </label>
                <Input
                  id="pricingModelValue"
                  type="number"
                  name="pricingModelValue"
                  required
                  min={0}
                  step="0.01"
                  value={formValues.pricingModelValue}
                  onChange={(e) => setFormValues((v) => ({ ...v, pricingModelValue: e.target.value }))}
                  onFocus={(e) => e.target.select()}
                  placeholder="0.00"
                />
                <p className="mt-1 text-xs text-[--color-muted]">
                  {formValues.pricingModel === 'CPM' && 'Cost per 1,000 impressions'}
                  {formValues.pricingModel === 'CPC' && 'Cost per click'}
                  {formValues.pricingModel === 'CPA' && 'Cost per acquisition/conversion'}
                  {formValues.pricingModel === 'FLAT_RATE' && 'Additional one-time or recurring fee'}
                </p>
                {requestState?.fieldErrors?.pricingModelValue && (
                  <p className="mt-1 text-sm text-[--color-error]">{requestState.fieldErrors.pricingModelValue}</p>
                )}
              </div>

              {/* Total Pricing Breakdown */}
              <div className="rounded-md border-2 border-[--color-primary] bg-[--color-background] p-3">
                <div className="mb-2 text-sm font-medium text-[--color-foreground]">Total Agreed Price</div>
                <div className="flex items-baseline gap-2 text-lg font-bold text-[--color-primary]">
                  <span>${Number(adSlot.basePrice ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <span className="text-xs font-normal text-[--color-muted]">per month</span>
                  <span className="text-[--color-muted]">+</span>
                  <span>${(formValues.pricingModelValue ? Number(formValues.pricingModelValue) : 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <span className="text-sm text-[--color-muted]">
                    ({formValues.pricingModel})
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="message" className="mb-1 block text-sm font-medium text-[--color-foreground]">
              Message <span className="font-normal text-[--color-muted]">(optional)</span>
            </label>
            <Input
              id="message"
              type="text"
              name="message"
              value={formValues.message}
              onChange={(e) => setFormValues((v) => ({ ...v, message: e.target.value }))}
              placeholder="Add a note for the publisher (optional)"
            />
          </div>

          {requestState?.error && (
            <Alert variant="error">{requestState.error}</Alert>
          )}

          <div className="pt-2">
            <SubmitButton />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
