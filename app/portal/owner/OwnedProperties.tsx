'use client';

import React from 'react';
import { Property, UserAccount } from '../types';
import { AlertTriangle, CheckCircle, Building2, Plus, MapPin } from 'lucide-react';

interface OwnedPropertiesProps {
  ownerMsg: string;
  ownerSuccess: string;
  editingPropertyId: string | null;
  setEditingPropertyId: (id: string | null) => void;
  newPropTitle: string;
  setNewPropTitle: (s: string) => void;
  newPropLocation: string;
  setNewPropLocation: (s: string) => void;
  newPropPrice: number;
  setNewPropPrice: (n: number) => void;
  newPropSupply: number;
  setNewPropSupply: (n: number) => void;
  newPropApy: number;
  setNewPropApy: (n: number) => void;
  newPropType: 'Apartment' | 'House' | 'Villa' | 'Studio' | 'Office' | 'Land' | 'Commercial Space';
  setNewPropType: (t: 'Apartment' | 'House' | 'Villa' | 'Studio' | 'Office' | 'Land' | 'Commercial Space') => void;
  newPropPurpose: 'FOR_RENT' | 'FOR_SALE' | 'FOR_RENT_AND_SALE';
  setNewPropPurpose: (p: 'FOR_RENT' | 'FOR_SALE' | 'FOR_RENT_AND_SALE') => void;
  deedDocName: string;
  setDeedDocName: (s: string) => void;
  photoMockUrl: string;
  setPhotoMockUrl: (s: string) => void;
  newPropDesc: string;
  setNewPropDesc: (s: string) => void;
  handleCreatePropertyDraft: (e: React.FormEvent) => void;
  properties: Property[];
  currentUser: UserAccount | null;
  submitDraftForReview: (id: string) => void;
  startEditProperty: (item: Property) => void;
  handleDeleteProperty: (id: string) => void;
}

export default function OwnedProperties({
  ownerMsg,
  ownerSuccess,
  editingPropertyId,
  setEditingPropertyId,
  newPropTitle,
  setNewPropTitle,
  newPropLocation,
  setNewPropLocation,
  newPropPrice,
  setNewPropPrice,
  newPropSupply,
  setNewPropSupply,
  newPropApy,
  setNewPropApy,
  newPropType,
  setNewPropType,
  newPropPurpose,
  setNewPropPurpose,
  deedDocName,
  setDeedDocName,
  photoMockUrl,
  setPhotoMockUrl,
  newPropDesc,
  setNewPropDesc,
  handleCreatePropertyDraft,
  properties,
  currentUser,
  submitDraftForReview,
  startEditProperty,
  handleDeleteProperty,
}: OwnedPropertiesProps) {
  const usersProperties = currentUser ? properties.filter((p) => p.ownerId === currentUser.id) : [];

  return (
    <div className="space-y-6" id="owner-properties-root">
      {/* SUCCESS / ERROR ALERTS */}
      {ownerMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs flex items-center gap-2 font-mono">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{ownerMsg}</span>
        </div>
      )}
      {ownerSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl text-xs flex items-center gap-2 font-mono">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{ownerSuccess}</span>
        </div>
      )}

      {/* ACTION TOGGLERS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CREATE DRAFT MOULDING FORM */}
        <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b pb-3 uppercase tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>{editingPropertyId ? 'Modify Property Details' : 'Create Property Draft'}</span>
          </h3>
          {editingPropertyId && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-2.5 rounded-lg text-xs font-mono flex items-center justify-between">
              <span>Editing active property draft</span>
              <button
                type="button"
                onClick={() => {
                  setEditingPropertyId(null);
                  setNewPropTitle('');
                  setNewPropLocation('');
                  setNewPropDesc('');
                  setDeedDocName('');
                  setPhotoMockUrl('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80');
                }}
                className="text-red-500 hover:underline hover:text-red-700 font-bold uppercase text-[10px] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}

          <form onSubmit={handleCreatePropertyDraft} className="space-y-3 font-mono text-xs text-slate-600" id="property-draft-form">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase mb-1">Property Name / Title</label>
              <input
                type="text"
                required
                value={newPropTitle}
                onChange={(e) => setNewPropTitle(e.target.value)}
                placeholder="e.g. VEX Obsidian Tower"
                className="w-full p-2.5 border rounded bg-slate-50 outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase mb-1">Physical Location</label>
              <input
                type="text"
                required
                value={newPropLocation}
                onChange={(e) => setNewPropLocation(e.target.value)}
                placeholder="e.g. Zurich, Switzerland"
                className="w-full p-2.5 border rounded bg-slate-50 outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1">Deed price (USD)</label>
                <input
                  type="number"
                  required
                  value={newPropPrice}
                  onChange={(e) => setNewPropPrice(Number(e.target.value))}
                  className="w-full p-2.5 border rounded bg-slate-50 outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1">Available Keys</label>
                <input
                  type="number"
                  required
                  value={newPropSupply}
                  onChange={(e) => setNewPropSupply(Number(e.target.value))}
                  className="w-full p-2.5 border rounded bg-slate-50 outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1">Listed APY</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newPropApy}
                  onChange={(e) => setNewPropApy(Number(e.target.value))}
                  className="w-full p-2.5 border rounded bg-slate-50 outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1">Prop Type</label>
                <select
                  value={newPropType}
                  onChange={(e: any) => setNewPropType(e.target.value)}
                  className="w-full p-2.5 border rounded bg-slate-50 outline-none focus:border-blue-500 font-mono bg-white text-xs cursor-pointer"
                >
                  <option value="Apartment">Apartment</option>
                  <option value="House">House</option>
                  <option value="Villa">Villa</option>
                  <option value="Studio">Studio</option>
                  <option value="Office">Office</option>
                  <option value="Land">Land</option>
                  <option value="Commercial Space">Commercial Space</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1">Purpose</label>
                <select
                  value={newPropPurpose}
                  onChange={(e: any) => setNewPropPurpose(e.target.value)}
                  className="w-full p-2.5 border rounded bg-slate-50 outline-none focus:border-blue-500 font-mono bg-white text-xs cursor-pointer"
                >
                  <option value="FOR_SALE">For Sale</option>
                  <option value="FOR_RENT">For Rent</option>
                  <option value="FOR_RENT_AND_SALE">For both</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1">Document deed</label>
                <input
                  type="text"
                  required
                  value={deedDocName}
                  onChange={(e) => setDeedDocName(e.target.value)}
                  placeholder="e.g. Zurich-Deed-92.pdf"
                  className="w-full p-2.5 border rounded bg-slate-50 outline-none focus:border-blue-500 font-mono text-[11px]"
                />
              </div>
            </div>

            <div id="property-formulation-box">
              <label className="block text-[10px] text-slate-400 uppercase mb-1 font-mono">Property Image Upload</label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-blue-500 transition-colors bg-slate-50 relative group">
                {photoMockUrl ? (
                  <div className="space-y-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photoMockUrl} alt="Preview" className="mx-auto h-24 w-auto rounded-lg object-cover border" />
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-[10px] text-slate-500 truncate max-w-[150px] font-mono">Image Loaded</span>
                      <button
                        type="button"
                        onClick={() => setPhotoMockUrl('')}
                        className="text-[10px] text-red-600 underline font-mono hover:text-red-800"
                      >
                        Clear Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Plus className="w-6 h-6 text-slate-400 mx-auto group-hover:text-blue-500" />
                    <span className="text-[11px] text-slate-500 block font-mono">Drag & drop or Click to Upload</span>
                    <span className="text-[9px] text-slate-400 block font-mono">PNG, Jpeg (parsed locally safely)</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === 'string') {
                          setPhotoMockUrl(reader.result);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="text-[9px] text-slate-400 font-mono">Or URL:</span>
                <input
                  type="text"
                  value={photoMockUrl.startsWith('data:') ? '' : photoMockUrl}
                  onChange={(e) => setPhotoMockUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 p-1 px-1.5 border rounded bg-slate-50 outline-none text-[9px] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase mb-1">Structure description</label>
              <textarea
                value={newPropDesc}
                onChange={(e) => setNewPropDesc(e.target.value)}
                placeholder="Detail properties specifications..."
                className="w-full p-2 border rounded bg-slate-50 outline-none focus:border-blue-500 font-mono h-16 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-mono font-bold tracking-widest uppercase py-3.5 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-xs"
            >
              {editingPropertyId ? 'SAVE CHANGES' : 'COMPILATE PROPERTY DRAFT'}
            </button>
          </form>
        </div>

        {/* OWNER PROPERTIES REGISTER LISTS */}
        <div className="lg:col-span-2 space-y-4" id="owner-properties-listings">
          <div className="bg-white p-4 rounded-xl border border-slate-200 font-mono font-bold text-xs uppercase text-slate-500 bg-slate-50 flex justify-between items-center">
            <span>Active Properties Registered ({usersProperties.length})</span>
            <span className="text-[10px] text-blue-600 lowercase font-normal">verified properties are automatically listed globally</span>
          </div>

          {usersProperties.length === 0 ? (
            <div className="bg-white rounded-2xl border p-12 text-center text-slate-400 space-y-2 font-mono">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs">You have zero listed real-estate properties registered under your owner key.</p>
              <p className="text-[10px] text-slate-400">Initialize a property draft in the sidebar mould to begin tracking compliance.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {usersProperties.map((item) => (
                <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{item.name}</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                        <MapPin className="w-3.5 h-3.5" /> {item.location}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] font-bold font-mono px-2 py-0.5 border rounded-full bg-slate-100 text-slate-600 uppercase">
                          {item.type}
                        </span>
                        <span className="text-[9px] font-bold font-mono px-2 py-0.5 border rounded bg-blue-50 text-blue-600 uppercase">
                          {item.purpose.replace('FOR_', '').replace('_', ' ')}
                        </span>
                        {item.occupancyStatus && (
                          <span className={`text-[9px] font-bold font-mono px-2 py-0.5 border rounded uppercase ${
                            item.occupancyStatus === 'OCCUPIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            item.occupancyStatus === 'RESERVED' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {item.occupancyStatus}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between items-end font-mono text-right text-xs gap-3">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase">AUDIT COMPLIANCE STATE</div>
                      <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded border uppercase mt-1 ${
                        item.status === 'PUBLISHED' || item.status === 'VERIFIED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : item.status === 'SUBMITTED'
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          : item.status === 'REJECTED'
                          ? 'bg-red-50 text-red-700 border-red-200 font-bold'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end mt-2">
                      {item.status === 'DRAFT' && (
                        <button
                          type="button"
                          onClick={() => submitDraftForReview(item.id)}
                          className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1.5 rounded hover:bg-blue-700 transition-colors uppercase cursor-pointer"
                        >
                          Submit Deed
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => startEditProperty(item)}
                        className="bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200 text-[10px] font-bold px-2.5 py-1.5 rounded transition-colors uppercase cursor-pointer"
                      >
                        Edit Listing
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProperty(item.id)}
                        className="border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 text-[10px] font-bold px-2.5 py-1.5 rounded transition-colors uppercase cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>

                    {item.status === 'REJECTED' && item.rejectionReason && (
                      <div className="text-[10px] text-rose-600 font-semibold max-w-[240px] text-left italic border-l-2 border-rose-500 pl-2 mt-2">
                        Rejection Notes: &quot;{item.rejectionReason}&quot;
                      </div>
                    )}
                    {item.status === 'PUBLISHED' && (
                      <div className="text-[10px] text-emerald-600 font-mono text-left font-semibold mt-2">
                        ID: {item.certificateId} <br />
                        Hash: {item.blockchainHash?.slice(0, 15)}...
                      </div>
                    )}
                    {item.occupancyStatus === 'OCCUPIED' && item.currentTenantName && (
                      <div className="text-[10px] text-blue-700 font-mono text-left mt-2 bg-blue-50 border border-blue-100 rounded-lg px-2 py-1.5">
                        <div className="font-bold uppercase tracking-wider text-[9px] text-blue-400 mb-0.5">Current Tenant</div>
                        <div>{item.currentTenantName}</div>
                        <div className="text-blue-400">{item.currentTenantEmail}</div>
                        {item.monthlyRent && <div className="text-emerald-600 font-bold mt-0.5">${item.monthlyRent.toLocaleString()}/mo</div>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
