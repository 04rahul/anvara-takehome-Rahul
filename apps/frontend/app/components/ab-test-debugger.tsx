'use client';

import { useEffect, useState } from 'react';
import { getAllVariants, clearVariant, forceVariant } from '@/lib/ab-test';
import { AB_TESTS } from '@/lib/ab-test-config';
import { getTrackedEvents, clearTrackedEvents } from '@/lib/analytics';

/**
 * A/B Test Debug Panel
 * 
 * Development-only floating panel that shows:
 * - Active test assignments
 * - Buttons to force specific variants
 * - Analytics events
 * - Reset functionality
 */
export function ABTestDebugger() {
  const [isOpen, setIsOpen] = useState(false);
  const [variants, setVariants] = useState<Record<string, string>>({});
  const [events, setEvents] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // #region agent log H1/H2
    fetch('http://127.0.0.1:7242/ingest/3f0b1e04-39fc-4b7e-98fa-50c590796815', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'pre-fix',
        hypothesisId: 'H1',
        location: 'app/components/ab-test-debugger.tsx:ABTestDebugger[mount]',
        message: 'ABTestDebugger mounted',
        data: {
          nodeEnv: process.env.NODE_ENV,
          pathname: typeof window !== 'undefined' ? window.location.pathname : 'server',
          abTestsKeys: Object.keys(AB_TESTS),
          hasMarketplaceFilterLayout: Object.prototype.hasOwnProperty.call(AB_TESTS, 'marketplace-filter-layout'),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion agent log H1/H2
  }, []);

  useEffect(() => {
    if (isOpen) {
      const nextVariants = getAllVariants();
      const nextEvents = getTrackedEvents().slice(-10); // Last 10 events

      // #region agent log H2
      fetch('http://127.0.0.1:7242/ingest/3f0b1e04-39fc-4b7e-98fa-50c590796815', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'debug-session',
          runId: 'pre-fix',
          hypothesisId: 'H2',
          location: 'app/components/ab-test-debugger.tsx:ABTestDebugger[open]',
          message: 'ABTestDebugger opened - registry + cookie variants snapshot',
          data: {
            abTestsKeys: Object.keys(AB_TESTS),
            cookieVariantKeys: Object.keys(nextVariants),
            marketplaceFilterLayoutCookieVariant: nextVariants['marketplace-filter-layout'] ?? null,
            recentEventCount: nextEvents.length,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion agent log H2

      setVariants(nextVariants);
      setEvents(nextEvents);
    }
  }, [isOpen, refreshKey]);

  const handleForceVariant = (testId: string, variant: string) => {
    forceVariant(testId, variant);
    setRefreshKey((prev) => prev + 1);
    // Reload page to see changes
    window.location.reload();
  };

  const handleClearTest = (testId: string) => {
    clearVariant(testId);
    setRefreshKey((prev) => prev + 1);
    // Reload page to see changes
    window.location.reload();
  };

  const handleClearAll = () => {
    clearVariant();
    clearTrackedEvents();
    setRefreshKey((prev) => prev + 1);
    // Reload page to see changes
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-purple-700 transition-colors"
          title="Open A/B Test Debugger"
        >
          🧪 A/B Tests
        </button>
      )}

      {/* Debug Panel */}
      {isOpen && (
        <div className="w-96 max-h-[600px] overflow-auto rounded-lg border border-purple-300 bg-white shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between border-b border-purple-200 bg-purple-600 px-4 py-3 text-white">
            <h3 className="font-semibold">🧪 A/B Test Debugger</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded hover:bg-purple-700 px-2 py-1 transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Active Tests */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Active Tests</h4>
              <div className="space-y-3">
                {Object.entries(AB_TESTS).map(([testId, config]) => {
                  const currentVariant = variants[testId];
                  return (
                    <div
                      key={testId}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                    >
                      <div className="mb-2">
                        <p className="text-sm font-medium text-gray-900">{testId}</p>
                        <p className="text-xs text-gray-600 mt-1">{config.description}</p>
                      </div>
                      <div className="mb-2">
                        <p className="text-xs text-gray-500 mb-1">
                          Current: <span className="font-semibold text-purple-600">
                            {currentVariant || 'Not assigned'}
                          </span>
                        </p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {config.variants.map((variant) => (
                          <button
                            key={variant}
                            onClick={() => handleForceVariant(testId, variant)}
                            className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                              currentVariant === variant
                                ? 'bg-purple-600 text-white'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {variant}
                          </button>
                        ))}
                        {currentVariant && (
                          <button
                            onClick={() => handleClearTest(testId)}
                            className="rounded px-2 py-1 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Events */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Recent Events</h4>
              <div className="max-h-48 overflow-auto rounded border border-gray-200 bg-gray-50 p-2">
                {events.length > 0 ? (
                  <div className="space-y-1">
                    {events.map((event, idx) => (
                      <div key={idx} className="text-xs font-mono text-gray-700">
                        <span className="text-purple-600 font-semibold">{event.event}</span>
                        {event.testId && (
                          <>
                            {' '}· <span className="text-gray-900">{event.testId}</span>
                          </>
                        )}
                        {event.variant && (
                          <>
                            {' '}→ <span className="text-green-600 font-semibold">{event.variant}</span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No events tracked yet</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-gray-200">
              <button
                onClick={handleClearAll}
                className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
              >
                Clear All Tests & Events
              </button>
            </div>

            {/* Info */}
            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                💡 Forcing a variant will reload the page. Clear cookies to get a new random assignment.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
