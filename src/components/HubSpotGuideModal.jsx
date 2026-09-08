import React, { useState } from 'react';
import { 
  X, 
  Key, 
  Check, 
  Copy, 
  ExternalLink
} from 'lucide-react';

export default function HubSpotGuideModal({ isOpen, onClose }) {
  const [copiedKey, setCopiedKey] = useState(null);

  if (!isOpen) return null;

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sampleEnvText = `HUBSPOT_ACCESS_TOKEN=pat-na1-your-actual-token
PORT=3001
HUBSPOT_PROP_SERVICE=services
HUBSPOT_PROP_COST=service_cost
HUBSPOT_PROP_BOOKING_DATE=booking_date
HUBSPOT_PROP_BOOKING_STATUS=booking_status
USE_MOCK_FALLBACK=true`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">HubSpot CRM Credentials & Setup</h2>
            <p className="text-xs text-slate-500">How to get your access token and connect your live CRM</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 leading-relaxed">
          {/* Section 1 */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              1. What Credentials Do We Need?
            </h3>
            <p className="text-slate-600 mb-2">
              You only need one credential: a <strong>HubSpot Private App Access Token</strong>.
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
              <li>HubSpot uses Private Apps for secure API access.</li>
              <li>Token starts with: <code className="text-slate-900 font-mono bg-slate-100 px-1 py-0.5 rounded">pat-na1-...</code> or <code className="text-slate-900 font-mono bg-slate-100 px-1 py-0.5 rounded">pat-eu1-...</code></li>
              <li>Required Scope: <code className="text-slate-900 font-mono font-semibold bg-slate-100 px-1 py-0.5 rounded">crm.objects.contacts.read</code></li>
            </ul>
          </div>

          {/* Section 2 */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              2. How to Get Your Access Token
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-slate-600">
              <li>Log in to <a href="https://app.hubspot.com" target="_blank" rel="noreferrer" className="text-indigo-600 underline inline-flex items-center gap-0.5">app.hubspot.com <ExternalLink className="w-3 h-3" /></a> and click the <strong>Settings (⚙️)</strong> icon.</li>
              <li>In the left sidebar, click <strong>Account Setup &gt; Integrations &gt; Private Apps</strong>.</li>
              <li>Click <strong>Create a private app</strong>, name it, and in the <strong>Scopes</strong> tab enable <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">crm.objects.contacts.read</code>.</li>
              <li>Click <strong>Create app</strong>, copy the token, and paste it into <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">.env</code> under <code className="font-mono text-slate-900 font-semibold">HUBSPOT_ACCESS_TOKEN</code>.</li>
            </ol>
          </div>

          {/* Section 3 */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              3. Contact Properties Mapping
            </h3>
            <p className="text-slate-600 mb-2">
              If your HubSpot contact property internal names differ from defaults, update them in <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">.env</code>:
            </p>
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Field</th>
                  <th className="py-2 px-3">Internal Name</th>
                  <th className="py-2 px-3">Format / Values</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2 px-3 font-medium">Service Booked</td>
                  <td className="py-2 px-3 font-mono text-slate-600">services</td>
                  <td className="py-2 px-3">Text / Dropdown (e.g. "Audit")</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Service Cost</td>
                  <td className="py-2 px-3 font-mono text-slate-600">service_cost</td>
                  <td className="py-2 px-3">Number (e.g. 150)</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Booking Date</td>
                  <td className="py-2 px-3 font-mono text-slate-600">booking_date</td>
                  <td className="py-2 px-3">Google Calendar format / ISO date</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Booking Status</td>
                  <td className="py-2 px-3 font-mono text-slate-600">booking_status</td>
                  <td className="py-2 px-3">'Confirmed', 'visited', or 'cancelled'</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 4 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-slate-900">Example .env</span>
              <button
                onClick={() => handleCopy(sampleEnvText, 'env')}
                className="flex items-center gap-1 text-slate-600 hover:text-slate-900 text-xs font-medium"
              >
                {copiedKey === 'env' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </>
                )}
              </button>
            </div>
            <pre className="bg-slate-50 border border-slate-200 text-slate-800 p-3 rounded text-xs font-mono overflow-x-auto">
              {sampleEnvText}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 flex justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
