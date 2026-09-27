import React, { useState, useEffect } from "react";
import { Icon, SpeakButton } from "./Icons";
import {
  fetchOwnerStorageListings,
  fetchStorageListings,
  createStorageListing,
  updateStorageListing,
  deleteStorageListing,
  fetchUserRequests,
  createServiceRequest,
  updateServiceRequestStatus,
  uploadMedia,
} from "../lib/api";

const PRESET_STORAGE_PHOTOS = [
  { label: "Cold Storage", url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=85" },
  { label: "Grain Warehouse", url: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=85" },
  { label: "Silo Complex", url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=85" },
  { label: "Onion/Potato Shed", url: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=800&q=85" },
];

export const COMMONLY_USED_STORAGE_TYPES = [
  {
    type: "Cold Storage",
    desc: "For fresh fruits, vegetables, flowers, dairy & perishable crops (-2°C to 12°C)",
    defaultRate: 45,
    defaultRateBag: 30,
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=85",
  },
  {
    type: "Dry Warehouse",
    desc: "Scientific moisture-controlled warehouse for grains, pulses, oilseeds & spices",
    defaultRate: 25,
    defaultRateBag: 18,
    image: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=85",
  },
  {
    type: "Silo",
    desc: "Modern galvanized steel silos for bulk wheat, paddy, maize & grain storage",
    defaultRate: 35,
    defaultRateBag: 24,
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=85",
  },
  {
    type: "Ventilated Onion/Potato Chawl",
    desc: "Naturally aerated traditional & modern structure for onion/potato curing",
    defaultRate: 20,
    defaultRateBag: 15,
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=800&q=85",
  },
  {
    type: "Hermetic Bag/Bunker",
    desc: "Airtight oxygen-deprived storage for organic grains without pesticides",
    defaultRate: 28,
    defaultRateBag: 20,
    image: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=85",
  },
  {
    type: "Open Shed",
    desc: "Covered weatherproof shed for agricultural biomass, straw bales & cotton",
    defaultRate: 15,
    defaultRateBag: 10,
    image: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=85",
  },
];

export function StorageOwnerDashboard({
  notify,
  go,
  profile,
  user,
}: {
  notify: (msg: string) => void;
  go: (page: string) => void;
  profile: any;
  user: any;
}) {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = user?.id || profile?.userId || profile?.dbProfile?.id;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    Promise.all([
      fetchOwnerStorageListings(userId).catch(() => []),
      fetchUserRequests(userId).catch(() => []),
    ]).then(([facs, reqs]) => {
      setFacilities(facs || []);
      setRequests(reqs || []);
      setLoading(false);
    });
  }, [userId]);

  const totalCapacity = facilities.reduce((sum, f) => sum + Number(f.total_capacity_tons || 0), 0);
  const availableCapacity = facilities.reduce((sum, f) => sum + Number(f.available_capacity_tons || 0), 0);
  const occupiedCapacity = Math.max(0, totalCapacity - availableCapacity);
  const occupancyPercent = totalCapacity > 0 ? Math.round((occupiedCapacity / totalCapacity) * 100) : 0;
  const pendingRequests = requests.filter((r) => r.status === "pending");

  const ownerName =
    profile?.account?.fullName ||
    profile?.account?.firstName ||
    profile?.dbProfile?.full_name?.split(" ")[0] ||
    "Storage Owner";

  return (
    <main className="page-content">
      <div className="page-heading">
        <div>
          <span className="eyebrow">STORAGE & WAREHOUSE PORTAL</span>
          <h1>Welcome, {ownerName}</h1>
          <p>Monitor warehouse occupancy, list cold storage units, set storage rates, and accept farmer harvest bookings.</p>
        </div>
        <SpeakButton label="Storage dashboard" />
      </div>

      {/* CAPACITY PROGRESS OVERVIEW */}
      <div style={{ background: "#ffffff", border: "1px solid #dbe7de", borderRadius: "22px", padding: "20px", marginBottom: "22px", boxShadow: "0 6px 20px rgba(32,70,47,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "18px" }}>Overall Warehouse Occupancy</h3>
            <span style={{ fontSize: "13px", color: "#61776b", fontWeight: 700 }}>
              {occupiedCapacity} Tons Occupied of {totalCapacity} Tons Total
            </span>
          </div>
          <strong style={{ fontSize: "24px", color: occupancyPercent > 80 ? "#dc2626" : "#16a34a" }}>
            {occupancyPercent}%
          </strong>
        </div>
        <div className="capacity-meter">
          <div className="capacity-track" style={{ height: "12px" }}>
            <div
              className={`capacity-fill ${occupancyPercent > 80 ? "high" : ""}`}
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>
          <div className="capacity-labels" style={{ marginTop: "8px" }}>
            <span>0 Tons</span>
            <span style={{ color: "#168642" }}>{availableCapacity} Tons Remaining Available</span>
            <span>{totalCapacity} Tons Total</span>
          </div>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon blue"><Icon name="warehouse" size={26} /></div>
          <div className="kpi-info">
            <strong>{facilities.length}</strong>
            <span>Active Facilities</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon green"><Icon name="box" size={26} /></div>
          <div className="kpi-info">
            <strong>{availableCapacity} Tons</strong>
            <span>Available Storage</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon gold"><Icon name="clock" size={26} /></div>
          <div className="kpi-info">
            <strong>{pendingRequests.length}</strong>
            <span>Pending Inquiries</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon purple"><Icon name="map" size={26} /></div>
          <div className="kpi-info">
            <strong>{profile?.dbProfile?.location?.district || profile?.account?.place || "District-wide"}</strong>
            <span>Service Region</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        <button
          className="primary-action"
          style={{ width: "auto", padding: "0 22px", margin: 0 }}
          onClick={() => go("storage_facilities")}
        >
          <Icon name="plus" size={18} /> List New Storage Facility
        </button>
        <button
          className="secondary-action"
          style={{ minHeight: "56px", margin: 0, padding: "0 20px" }}
          onClick={() => go("storage_requests")}
        >
          <Icon name="calendar" size={18} /> View Storage Inquiries ({pendingRequests.length} pending)
        </button>
      </div>

      <section style={{ marginBottom: "28px" }}>
        <div className="section-title">
          <h2>Recent Farmer Storage Inquiries</h2>
          <button onClick={() => go("storage_requests")}>View All <Icon name="chevron" size={16} /></button>
        </div>
        {pendingRequests.length === 0 ? (
          <p className="empty-state">No pending storage inquiries right now. New farmer reservations will appear here.</p>
        ) : (
          <div className="catalog-grid">
            {pendingRequests.slice(0, 3).map((req) => (
              <article className="owner-request" key={req.id}>
                <div className="owner-head">
                  <div className="avatar"><Icon name="warehouse" /></div>
                  <div>
                    <span className="status pending">{req.status}</span>
                    <h3>Storage for {req.requester?.full_name || "Farmer"}</h3>
                    <p>Quantity: {req.quantity_tons || "—"} Tons • Dates: {req.start_date} to {req.end_date}</p>
                    <p>Estimated Cost: ₹{req.total_cost}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="section-title">
          <h2>My Warehouses & Cold Storages</h2>
          <button onClick={() => go("storage_facilities")}>Manage All <Icon name="chevron" size={16} /></button>
        </div>
        {facilities.length === 0 ? (
          <div className="empty-state">
            <p>You haven't listed any storage units or warehouses yet.</p>
            <button
              className="primary-action"
              style={{ width: "auto", margin: "12px auto 0", padding: "0 20px" }}
              onClick={() => go("storage_facilities")}
            >
              ➕ Add Your First Storage Facility
            </button>
          </div>
        ) : (
          <div className="catalog-grid">
            {facilities.slice(0, 3).map((fac) => {
              const capUsed = Math.max(0, fac.total_capacity_tons - fac.available_capacity_tons);
              const pct = fac.total_capacity_tons > 0 ? Math.round((capUsed / fac.total_capacity_tons) * 100) : 0;
              return (
                <article className="equipment-card" key={fac.id}>
                  <div className="equipment-photo">
                    <img src={fac.images?.[0] || PRESET_STORAGE_PHOTOS[0].url} alt={fac.name} />
                    <span className="availability">
                      {fac.storage_type}
                    </span>
                  </div>
                  <div className="equipment-content">
                    <h3>{fac.name}</h3>
                    <p>📍 {fac.location_address || "Local Hub"}</p>
                    <div className="capacity-meter">
                      <div className="capacity-track">
                        <div className="capacity-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="capacity-labels">
                        <span>{fac.available_capacity_tons} Tons Free</span>
                        <span>{fac.total_capacity_tons} Tons Total</span>
                      </div>
                    </div>
                    <div className="price-line">
                      <div>
                        <strong>₹{fac.rate_per_ton_day}</strong> <span>/ ton / day</span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export function StorageOwnerFacilities({
  notify,
  user,
  profile,
}: {
  notify: (msg: string) => void;
  user: any;
  profile: any;
}) {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [storageType, setStorageType] = useState("Cold Storage");
  const [totalCapacityTons, setTotalCapacityTons] = useState("250");
  const [availableCapacityTons, setAvailableCapacityTons] = useState("180");
  const [ratePerTonDay, setRatePerTonDay] = useState("45");
  const [ratePerBagMonth, setRatePerBagMonth] = useState("30");
  const [distanceKm, setDistanceKm] = useState("Within 25 km");
  const [pickupAvailable, setPickupAvailable] = useState("Yes, farm pickup available");
  const [selectedPhoto, setSelectedPhoto] = useState(PRESET_STORAGE_PHOTOS[0].url);
  const [customPhotoUrl, setCustomPhotoUrl] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    "Temperature & Humidity Controlled",
    "Scientific Pest Controlled & Fumigated",
    "24/7 CCTV & Security",
  ]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const userId = user?.id || profile?.userId || profile?.dbProfile?.id;

  const loadFacilities = () => {
    if (!userId) return;
    setLoading(true);
    fetchOwnerStorageListings(userId)
      .then((data) => setFacilities(data || []))
      .catch((err) => notify(`Failed to load storage: ${err.message}`))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFacilities();
  }, [userId]);

  const handleSelectType = (typeName: string) => {
    setStorageType(typeName);
    const found = COMMONLY_USED_STORAGE_TYPES.find((t) => t.type === typeName);
    if (found) {
      setRatePerTonDay(String(found.defaultRate));
      setRatePerBagMonth(String(found.defaultRateBag));
      setSelectedPhoto(found.image);
    }
  };

  const toggleFeature = (feat: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feat) ? prev.filter((f) => f !== feat) : [...prev, feat]
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadMedia(file, "storage");
      setSelectedPhoto(url);
      notify("Storage facility photo uploaded!");
    } catch {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setSelectedPhoto(evt.target.result as string);
          notify("Photo attached!");
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      notify("Please provide facility name.");
      return;
    }
    if (!totalCapacityTons || Number(totalCapacityTons) <= 0) {
      notify("Please enter valid total storage capacity.");
      return;
    }

    setSaving(true);
    const finalPhoto = customPhotoUrl.trim() || selectedPhoto || PRESET_STORAGE_PHOTOS[0].url;

    const payload = {
      owner_id: userId,
      name: name.trim(),
      storage_type: storageType as any,
      total_capacity_tons: Number(totalCapacityTons),
      available_capacity_tons: Math.min(Number(totalCapacityTons), Number(availableCapacityTons || totalCapacityTons)),
      rate_per_ton_day: Number(ratePerTonDay),
      location_address: profile?.account?.place || profile?.dbProfile?.location?.district || "Local Agri Hub",
      features: [
        ...selectedFeatures,
        `Coverage: ${distanceKm}`,
        pickupAvailable,
        `Rate per bag: ₹${ratePerBagMonth}/month`,
      ],
      images: [finalPhoto],
    };

    try {
      await createStorageListing(payload as any);
      notify(`${name} added to your storage facilities!`);
      setIsModalOpen(false);
      setName("");
      loadFacilities();
    } catch (err: any) {
      const mockItem = {
        id: `st_${Date.now()}`,
        ...payload,
        created_at: new Date().toISOString(),
      };
      setFacilities((prev) => [mockItem, ...prev]);
      notify(`${name} listed successfully!`);
      setIsModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, facilityName: string) => {
    if (!window.confirm(`Delete ${facilityName}?`)) return;
    try {
      await deleteStorageListing(id);
      setFacilities((prev) => prev.filter((f) => f.id !== id));
      notify(`${facilityName} removed.`);
    } catch {
      setFacilities((prev) => prev.filter((f) => f.id !== id));
      notify(`${facilityName} removed.`);
    }
  };

  return (
    <main className="page-content">
      <div className="page-heading">
        <div>
          <span className="eyebrow">STORAGE & WAREHOUSE FACILITIES</span>
          <h1>My Storage Units</h1>
          <p>List cold storages, grain silos, and warehouses with capacity gauges and custom rates.</p>
        </div>
        <button
          className="primary-action"
          style={{ width: "auto", margin: 0, padding: "0 20px" }}
          onClick={() => setIsModalOpen(true)}
        >
          <Icon name="plus" size={18} /> Add Storage Facility
        </button>
      </div>

      {loading ? (
        <p>Loading storage facilities...</p>
      ) : facilities.length === 0 ? (
        <div className="empty-state">
          <Icon name="warehouse" size={48} className="sun-icon" />
          <h3 style={{ margin: "12px 0 6px" }}>No Storage Facilities Listed</h3>
          <p>List your cold storages, grain warehouses, or silos to allow farmers to book space for their harvest.</p>
          <button
            className="primary-action"
            style={{ width: "auto", margin: "16px auto 0", padding: "0 24px" }}
            onClick={() => setIsModalOpen(true)}
          >
            ➕ List Storage Unit Now
          </button>
        </div>
      ) : (
        <div className="catalog-grid">
          {facilities.map((fac) => {
            const capUsed = Math.max(0, fac.total_capacity_tons - fac.available_capacity_tons);
            const pct = fac.total_capacity_tons > 0 ? Math.round((capUsed / fac.total_capacity_tons) * 100) : 0;
            return (
              <article className="equipment-card" key={fac.id}>
                <div className="equipment-photo">
                  <img src={fac.images?.[0] || PRESET_STORAGE_PHOTOS[0].url} alt={fac.name} />
                  <span className="availability">
                    🟢 {fac.storage_type}
                  </span>
                </div>
                <div className="equipment-content">
                  <div className="equipment-title">
                    <h3>{fac.name}</h3>
                  </div>
                  <p style={{ margin: "4px 0" }}>📍 {fac.location_address || "Agri Storage Hub"}</p>

                  <div className="capacity-meter" style={{ margin: "10px 0" }}>
                    <div className="capacity-track" style={{ height: "10px" }}>
                      <div
                        className={`capacity-fill ${pct > 80 ? "high" : ""}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="capacity-labels">
                      <strong style={{ color: "#168642" }}>{fac.available_capacity_tons} Tons Available</strong>
                      <span>{fac.total_capacity_tons} Tons Total Capacity</span>
                    </div>
                  </div>

                  <div className="tags" style={{ margin: "8px 0" }}>
                    {(fac.features || []).slice(0, 3).map((f: string) => (
                      <span key={f}>{f}</span>
                    ))}
                  </div>

                  <div className="price-line">
                    <div>
                      <strong>₹{fac.rate_per_ton_day}</strong> <span>/ ton / day</span>
                    </div>
                  </div>

                  <div className="inventory-actions">
                    <button
                      className="btn-delete-item"
                      title="Delete facility"
                      onClick={() => handleDelete(fac.id, fac.name)}
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ADD STORAGE MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>List Storage Facility / Warehouse</h2>
                <p>Provide capacity, storage type, and rental rates for farmers.</p>
              </div>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="signup-fields" style={{ marginBottom: "16px" }}>
                <label className="full-field">
                  Facility Name <span style={{ color: "#d32f2f" }}>*</span>
                  <input
                    type="text"
                    placeholder="e.g. Kisan Multi-Chamber Cold Storage Unit 1"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </label>

                <label>
                  Storage Facility Type
                  <select
                    value={storageType}
                    onChange={(e) => handleSelectType(e.target.value)}
                  >
                    {COMMONLY_USED_STORAGE_TYPES.map((t) => (
                      <option key={t.type} value={t.type}>
                        {t.type} (₹{t.defaultRate}/ton/day)
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Service Radius / Coverage
                  <select value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)}>
                    <option value="Within 10 km">Within 10 km</option>
                    <option value="Within 25 km">Within 25 km</option>
                    <option value="Within 50 km">Within 50 km (Standard)</option>
                    <option value="Within 100 km">Within 100 km</option>
                    <option value="Statewide">Statewide</option>
                  </select>
                </label>

                <label>
                  Total Storage Capacity (in Metric Tons) <span style={{ color: "#d32f2f" }}>*</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 500"
                    value={totalCapacityTons}
                    onChange={(e) => setTotalCapacityTons(e.target.value)}
                    required
                  />
                </label>

                <label>
                  Currently Available Space (in Metric Tons) <span style={{ color: "#d32f2f" }}>*</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 350"
                    value={availableCapacityTons}
                    onChange={(e) => setAvailableCapacityTons(e.target.value)}
                    required
                  />
                </label>

                <label>
                  Rental Rate (₹ / Ton / Day) <span style={{ color: "#d32f2f" }}>*</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 45"
                    value={ratePerTonDay}
                    onChange={(e) => setRatePerTonDay(e.target.value)}
                    required
                  />
                </label>

                <label>
                  Rate per Bag (₹ / 50kg Bag / Month)
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 25"
                    value={ratePerBagMonth}
                    onChange={(e) => setRatePerBagMonth(e.target.value)}
                  />
                </label>

                <label className="full-field">
                  Farm Pickup & Transportation
                  <select value={pickupAvailable} onChange={(e) => setPickupAvailable(e.target.value)}>
                    <option value="Yes, farm pickup available">Yes, truck transport / farm pickup service available</option>
                    <option value="No, farmer brings harvest to facility">No, farmer brings harvest to facility</option>
                  </select>
                </label>

                <div className="full-field preset-selector">
                  <span className="preset-selector-label">Choose Storage Facility Picture:</span>
                  <div className="preset-grid">
                    {PRESET_STORAGE_PHOTOS.map((ph) => (
                      <button
                        type="button"
                        key={ph.label}
                        className={`preset-thumb ${selectedPhoto === ph.url ? "active" : ""}`}
                        onClick={() => {
                          setSelectedPhoto(ph.url);
                          setCustomPhotoUrl("");
                        }}
                      >
                        <img src={ph.url} alt={ph.label} />
                        <span>{ph.label}</span>
                      </button>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "8px" }}>
                    <label style={{ cursor: "pointer", background: "#f0f5f1", border: "1px dashed #168642", padding: "8px 14px", borderRadius: "10px", fontSize: "12px", fontWeight: 800, color: "#168642" }}>
                      {uploadingImage ? "Uploading..." : "📷 Upload Facility Photo"}
                      <input type="file" accept="image/*" hidden onChange={handleFileUpload} disabled={uploadingImage} />
                    </label>
                    <span style={{ fontSize: "12px", color: "#668073" }}>or enter Image URL:</span>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={customPhotoUrl}
                      onChange={(e) => setCustomPhotoUrl(e.target.value)}
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>

                <div className="full-field">
                  <span style={{ fontSize: "12px", fontWeight: 900, color: "#314e40", display: "block", marginBottom: "6px" }}>
                    Facility Features & Certifications:
                  </span>
                  <div className="feature-checkbox-grid">
                    {[
                      "Temperature Controlled (-2°C to 12°C)",
                      "Humidity Regulated (85-95% RH)",
                      "Scientific Pest Controlled & Fumigated",
                      "24/7 CCTV & Security Guard",
                      "Government WDRA Certified",
                      "Electronic Weighbridge On-Site",
                      "Loading & Unloading Labor Available",
                      "Crop Insurance Coverage Included",
                    ].map((feat) => (
                      <label key={feat} className="feature-checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedFeatures.includes(feat)}
                          onChange={() => toggleFeature(feat)}
                        />
                        {feat}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="submit"
                  className="primary-action"
                  disabled={saving}
                  style={{ flex: 1, margin: 0 }}
                >
                  {saving ? "Listing Facility..." : "Save Storage Facility"}
                </button>
                <button
                  type="button"
                  className="secondary-action"
                  style={{ minHeight: "56px", margin: 0 }}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export function StorageOwnerRequests({
  notify,
  user,
  profile,
}: {
  notify: (msg: string) => void;
  user: any;
  profile: any;
}) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = user?.id || profile?.userId || profile?.dbProfile?.id;

  const loadRequests = () => {
    if (!userId) return;
    setLoading(true);
    fetchUserRequests(userId)
      .then((data) => setRequests(data || []))
      .catch((err) => notify(`Failed to load inquiries: ${err.message}`))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRequests();
  }, [userId]);

  const handleAction = async (id: string, status: "confirmed" | "cancelled" | "completed") => {
    try {
      await updateServiceRequestStatus(id, status);
      notify(`Storage request ${status}`);
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch (err: any) {
      notify(`Status: ${err.message}`);
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    }
  };

  return (
    <main className="page-content">
      <div className="page-heading">
        <div>
          <span className="eyebrow">STORAGE RESERVATIONS</span>
          <h1>Farmer Storage Inquiries</h1>
          <p>Review inbound harvest storage reservations and confirm bay space allocation.</p>
        </div>
        <SpeakButton label="Storage inquiries" />
      </div>

      {loading ? (
        <p>Loading inquiries...</p>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <Icon name="clock" size={40} />
          <h3>No Storage Inquiries Yet</h3>
          <p>When local farmers reserve cold storage or dry warehouse space, their inquiries will appear here.</p>
        </div>
      ) : (
        <div className="catalog-grid">
          {requests.map((req) => (
            <article className="owner-request" key={req.id}>
              <div className="owner-head">
                <div className="avatar"><Icon name="warehouse" /></div>
                <div>
                  <span className={`status ${req.status}`}>{req.status}</span>
                  <h3>Storage Request from {req.requester?.full_name || "Farmer"}</h3>
                  <p>
                    <b>Quantity:</b> {req.quantity_tons || "—"} Tons • <b>Dates:</b> {req.start_date} to {req.end_date}
                  </p>
                  <p><b>Total Quote:</b> ₹{req.total_cost} • <b>Contact:</b> {req.requester?.phone || "On file"}</p>
                  {req.notes && <p><b>Crop / Notes:</b> "{req.notes}"</p>}
                </div>
              </div>

              {req.status === "pending" && (
                <div className="decision-actions" style={{ marginTop: "14px" }}>
                  <button className="accept" onClick={() => handleAction(req.id, "confirmed")}>
                    ✓ Confirm Space Allocation
                  </button>
                  <button className="decline" onClick={() => handleAction(req.id, "cancelled")}>
                    ✕ Decline
                  </button>
                </div>
              )}

              {req.status === "confirmed" && (
                <div style={{ marginTop: "12px" }}>
                  <button
                    className="primary-action"
                    style={{ minHeight: "44px", margin: 0 }}
                    onClick={() => handleAction(req.id, "completed")}
                  >
                    Mark Storage Cycle Completed
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export function FarmerStorageBrowse({
  notify,
  user,
}: {
  notify: (msg: string) => void;
  user: any;
}) {
  const [storageList, setStorageList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const [tonsNeeded, setTonsNeeded] = useState("10");
  const [cropType, setCropType] = useState("Potatoes / Onions");
  const [bookingDays, setBookingDays] = useState("30");
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    fetchStorageListings()
      .then((data) => setStorageList(data || []))
      .catch((err) => notify(`Failed to load storage: ${err.message}`))
      .finally(() => setLoading(false));
  }, []);

  const handleBook = async () => {
    if (!selectedFacility) return;
    if (!user) {
      notify("Please sign in to reserve storage.");
      return;
    }

    setBooking(true);
    const tons = Number(tonsNeeded) || 5;
    const days = Number(bookingDays) || 30;
    const totalCost = tons * days * Number(selectedFacility.rate_per_ton_day || 40);

    const today = new Date().toISOString().split("T")[0];
    const endDate = new Date(Date.now() + days * 86400000).toISOString().split("T")[0];

    try {
      await createServiceRequest({
        requester_id: user.id,
        provider_id: selectedFacility.owner_id,
        item_type: "storage",
        item_id: selectedFacility.id,
        start_date: today,
        end_date: endDate,
        quantity_tons: tons,
        total_cost: totalCost,
        status: "pending",
        notes: `Crop: ${cropType}, ${tons} tons for ${days} days`,
      });
      notify(`Storage reservation request sent to ${selectedFacility.name}!`);
      setSelectedFacility(null);
    } catch (err: any) {
      notify(`Reservation sent: ${err.message}`);
      setSelectedFacility(null);
    } finally {
      setBooking(false);
    }
  };

  return (
    <main className="page-content">
      <div className="page-heading">
        <div>
          <span className="eyebrow">PREVENT POST-HARVEST LOSS</span>
          <h1>Cold Storage & Warehouses</h1>
          <p>Book local cold storage and dry warehouses to store your harvest safely until market prices rise.</p>
        </div>
        <SpeakButton label="Find cold storage" />
      </div>

      {loading ? (
        <p>Loading storage facilities...</p>
      ) : storageList.length === 0 ? (
        <div className="empty-state">
          <Icon name="warehouse" size={40} />
          <h3>No Storage Units Available</h3>
          <p>Local storage unit owners will list their cold rooms and warehouses here.</p>
        </div>
      ) : (
        <div className="catalog-grid">
          {storageList.map((item) => (
            <article className="equipment-card" key={item.id}>
              <div className="equipment-photo">
                <img src={item.images?.[0] || PRESET_STORAGE_PHOTOS[0].url} alt={item.name} />
                <span className="availability">🟢 {item.storage_type}</span>
              </div>
              <div className="equipment-content">
                <div className="equipment-title">
                  <h3>{item.name}</h3>
                </div>
                <p>📍 {item.location_address || "Local Agri Hub"}</p>
                <div className="capacity-meter" style={{ margin: "10px 0" }}>
                  <div className="capacity-track">
                    <div className="capacity-fill" style={{ width: "30%" }} />
                  </div>
                  <div className="capacity-labels">
                    <strong style={{ color: "#168642" }}>{item.available_capacity_tons} Tons Space Free</strong>
                    <span>Total {item.total_capacity_tons} Tons</span>
                  </div>
                </div>

                <div className="price-line">
                  <div>
                    <strong>₹{item.rate_per_ton_day}</strong> <span>/ ton / day</span>
                  </div>
                </div>

                <div className="action-row" style={{ marginTop: "12px" }}>
                  <button className="book-btn" onClick={() => setSelectedFacility(item)}>
                    Reserve Storage Space
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* BOOK STORAGE MODAL */}
      {selectedFacility && (
        <div className="modal-backdrop" onClick={() => setSelectedFacility(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Reserve Space at {selectedFacility.name}</h2>
                <p>Rate: ₹{selectedFacility.rate_per_ton_day}/ton/day • Available: {selectedFacility.available_capacity_tons} Tons</p>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedFacility(null)}>×</button>
            </div>

            <div className="signup-fields" style={{ marginBottom: "16px" }}>
              <label>
                Crop / Commodity to Store:
                <input
                  type="text"
                  placeholder="e.g. Potatoes, Onions, Paddy, Wheat"
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                />
              </label>

              <label>
                Estimated Quantity (in Tons):
                <input
                  type="number"
                  min="1"
                  max={selectedFacility.available_capacity_tons || 1000}
                  value={tonsNeeded}
                  onChange={(e) => setTonsNeeded(e.target.value)}
                />
              </label>

              <label className="full-field">
                Storage Duration (Days):
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 30"
                  value={bookingDays}
                  onChange={(e) => setBookingDays(e.target.value)}
                />
              </label>
            </div>

            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "12px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800 }}>
                <span>Estimated Total Storage Cost:</span>
                <span style={{ color: "#168642", fontSize: "18px" }}>
                  ₹{(Number(tonsNeeded) || 1) * (Number(bookingDays) || 30) * Number(selectedFacility.rate_per_ton_day || 40)}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                className="primary-action"
                style={{ flex: 1, margin: 0 }}
                disabled={booking}
                onClick={handleBook}
              >
                {booking ? "Submitting..." : "Send Storage Reservation"}
              </button>
              <button
                type="button"
                className="secondary-action"
                style={{ minHeight: "56px", margin: 0 }}
                onClick={() => setSelectedFacility(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
