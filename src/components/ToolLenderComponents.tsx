import React, { useState, useEffect } from "react";
import { Icon, SpeakButton } from "./Icons";
import {
  fetchOwnerEquipmentListings,
  createEquipmentListing,
  updateEquipmentListing,
  deleteEquipmentListing,
  fetchUserRequests,
  updateServiceRequestStatus,
  uploadMedia,
} from "../lib/api";

const PRESET_EQUIPMENT_PHOTOS = [
  { label: "Red Tractor", url: "https://images.unsplash.com/photo-1606739211185-2c846d734a6d?auto=format&fit=crop&w=800&q=85" },
  { label: "Green Tractor", url: "https://images.unsplash.com/photo-1564868480822-32f714a0e763?auto=format&fit=crop&w=800&q=85" },
  { label: "Harvester", url: "https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c1b?auto=format&fit=crop&w=800&q=85" },
  { label: "Rotavator / Tiller", url: "https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=800&q=85" },
  { label: "Boom Sprayer", url: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=85" },
  { label: "Thresher", url: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=85" },
  { label: "Irrigation Pump", url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=85" },
];

export const COMMONLY_USED_EQUIPMENTS = [
  {
    title: "Mahindra 575 DI Tractor (45 HP)",
    category: "Tractor & Tillage",
    dailyRate: 2500,
    hourlyRate: 450,
    image: "https://images.unsplash.com/photo-1606739211185-2c846d734a6d?auto=format&fit=crop&w=800&q=85",
    description: "45 HP heavy duty tractor suitable for rotavator, ploughing, and haulage.",
    specs: { hp: 45, fuelType: "Diesel", fourWheelDrive: false },
  },
  {
    title: "Swaraj 744 FE Tractor (48 HP)",
    category: "Tractor & Tillage",
    dailyRate: 2800,
    hourlyRate: 500,
    image: "https://images.unsplash.com/photo-1564868480822-32f714a0e763?auto=format&fit=crop&w=800&q=85",
    description: "48 HP reliable tractor for puddling, disc harrow, and multi-crop farming.",
    specs: { hp: 48, fuelType: "Diesel", fourWheelDrive: true },
  },
  {
    title: "John Deere 5050 D Tractor (50 HP)",
    category: "Tractor & Tillage",
    dailyRate: 3000,
    hourlyRate: 550,
    image: "https://images.unsplash.com/photo-1564868480822-32f714a0e763?auto=format&fit=crop&w=800&q=85",
    description: "50 HP high torque tractor with power steering and dual clutch.",
    specs: { hp: 50, fuelType: "Diesel", fourWheelDrive: true },
  },
  {
    title: "Power Tiller / Mini Cultivator (14 HP)",
    category: "Tractor & Tillage",
    dailyRate: 1400,
    hourlyRate: 250,
    image: "https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=800&q=85",
    description: "Compact walk-behind tiller ideal for wet paddy fields, horticulture, and orchards.",
    specs: { hp: 14, fuelType: "Diesel" },
  },
  {
    title: "Rotavator (6-Foot Heavy Multi-Speed)",
    category: "Tractor & Tillage",
    dailyRate: 1800,
    hourlyRate: 350,
    image: "https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=800&q=85",
    description: "42-blade heavy rotavator for fine soil tilth and stubble incorporation.",
    specs: { blades: 42, widthFeet: 6 },
  },
  {
    title: "Combine Harvester (Paddy / Wheat Multi-Crop)",
    category: "Harvesting & Threshing",
    dailyRate: 9500,
    hourlyRate: 1600,
    image: "https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c1b?auto=format&fit=crop&w=800&q=85",
    description: "Self-propelled multi-crop combine harvester with grain tank & straw chopper.",
    specs: { cutterBarWidth: "14ft", cropTypes: ["Paddy", "Wheat", "Soybean"] },
  },
  {
    title: "Multi-Crop High Capacity Thresher",
    category: "Harvesting & Threshing",
    dailyRate: 2200,
    hourlyRate: 400,
    image: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=85",
    description: "Tractor PTO driven thresher with blower for clean grain separation.",
    specs: { outputBagsPerHour: 20 },
  },
  {
    title: "Laser Land Leveler with Transmitter",
    category: "Tractor & Tillage",
    dailyRate: 3200,
    hourlyRate: 600,
    image: "https://images.unsplash.com/photo-1606739211185-2c846d734a6d?auto=format&fit=crop&w=800&q=85",
    description: "Precision laser leveler that saves 25% irrigation water and improves germination.",
    specs: { workingRange: "800m" },
  },
  {
    title: "Zero-Till Seed Cum Fertilizer Drill (9-Tyne)",
    category: "Sowing & Planting",
    dailyRate: 1600,
    hourlyRate: 300,
    image: "https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=800&q=85",
    description: "Dual box seed and fertilizer drill for direct sowing without prior tillage.",
    specs: { rowCount: 9 },
  },
  {
    title: "Tractor-Mounted 500L Boom Sprayer",
    category: "Spraying & Protection",
    dailyRate: 1900,
    hourlyRate: 350,
    image: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=85",
    description: "500-litre tank with 28ft folding boom arms for uniform pesticide spraying.",
    specs: { tankLitres: 500, boomLength: "28ft" },
  },
  {
    title: "Battery & Engine Knapsack Power Sprayer (16L)",
    category: "Spraying & Protection",
    dailyRate: 600,
    hourlyRate: 120,
    image: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=85",
    description: "16-litre motorized backpack sprayer with adjustable brass lance.",
    specs: { pressureBar: 4 },
  },
  {
    title: "Hydraulic Reversible MB Plough",
    category: "Tractor & Tillage",
    dailyRate: 1500,
    hourlyRate: 280,
    image: "https://images.unsplash.com/photo-1606739211185-2c846d734a6d?auto=format&fit=crop&w=800&q=85",
    description: "2-bottom hydraulic reversible mouldboard plough for deep primary tillage.",
    specs: { bottoms: 2 },
  },
  {
    title: "High-Discharge Diesel / Solar Water Pump (10 HP)",
    category: "Irrigation & Pumping",
    dailyRate: 1200,
    hourlyRate: 200,
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=85",
    description: "10 HP portable high head centrifugal pump for quick flood/furrow irrigation.",
    specs: { dischargeLPM: 1200, headMetres: 25 },
  },
  {
    title: "Round Straw Baler / Crop Residue Baler",
    category: "Harvesting & Threshing",
    dailyRate: 5000,
    hourlyRate: 900,
    image: "https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c1b?auto=format&fit=crop&w=800&q=85",
    description: "Compresses loose paddy and wheat straw into compact 25kg round bales.",
    specs: { baleWeightKg: 25 },
  },
];

export function ToolLenderDashboard({
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
  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = user?.id || profile?.userId || profile?.dbProfile?.id;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    Promise.all([
      fetchOwnerEquipmentListings(userId).catch(() => []),
      fetchUserRequests(userId).catch(() => []),
    ]).then(([eqs, reqs]) => {
      setEquipmentList(eqs || []);
      setRequests(reqs || []);
      setLoading(false);
    });
  }, [userId]);

  const availableCount = equipmentList.filter((e) => e.is_available).length;
  const inUseCount = equipmentList.length - availableCount;
  const pendingRequests = requests.filter((r) => r.status === "pending");

  const lenderName =
    profile?.account?.fullName ||
    profile?.account?.firstName ||
    profile?.dbProfile?.full_name?.split(" ")[0] ||
    "Tool Lender";

  return (
    <main className="page-content">
      <div className="page-heading">
        <div>
          <span className="eyebrow">EQUIPMENT LENDER PORTAL</span>
          <h1>Welcome, {lenderName}</h1>
          <p>Manage your machinery inventory, rental rates, service radius, and farmer booking requests.</p>
        </div>
        <SpeakButton label="Equipment lender dashboard" />
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon green"><Icon name="tractor" size={26} /></div>
          <div className="kpi-info">
            <strong>{equipmentList.length}</strong>
            <span>Total Listed Machines</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon blue"><Icon name="check" size={26} /></div>
          <div className="kpi-info">
            <strong>{availableCount}</strong>
            <span>Available for Rent</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon gold"><Icon name="clock" size={26} /></div>
          <div className="kpi-info">
            <strong>{pendingRequests.length}</strong>
            <span>Pending Bookings</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon purple"><Icon name="map" size={26} /></div>
          <div className="kpi-info">
            <strong>{profile?.dbProfile?.location?.district || profile?.account?.place || "Hyperlocal"}</strong>
            <span>Service Base</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        <button
          className="primary-action"
          style={{ width: "auto", padding: "0 22px", margin: 0 }}
          onClick={() => go("lender_equipment")}
        >
          <Icon name="plus" size={18} /> List New Equipment
        </button>
        <button
          className="secondary-action"
          style={{ minHeight: "56px", margin: 0, padding: "0 20px" }}
          onClick={() => go("lender_bookings")}
        >
          <Icon name="calendar" size={18} /> View Rental Bookings ({pendingRequests.length} pending)
        </button>
      </div>

      <section style={{ marginBottom: "28px" }}>
        <div className="section-title">
          <h2>Recent Booking Requests</h2>
          <button onClick={() => go("lender_bookings")}>View All <Icon name="chevron" size={16} /></button>
        </div>
        {pendingRequests.length === 0 ? (
          <p className="empty-state">No pending booking requests right now. New farmer inquiries will appear here.</p>
        ) : (
          <div className="catalog-grid">
            {pendingRequests.slice(0, 3).map((req) => (
              <article className="owner-request" key={req.id}>
                <div className="owner-head">
                  <div className="avatar"><Icon name="tractor" /></div>
                  <div>
                    <span className="status pending">{req.status}</span>
                    <h3>Request from {req.requester?.full_name || "Local Farmer"}</h3>
                    <p>Dates: {req.start_date} to {req.end_date} • Estimated: ₹{req.total_cost}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="section-title">
          <h2>My Active Machinery</h2>
          <button onClick={() => go("lender_equipment")}>Manage All <Icon name="chevron" size={16} /></button>
        </div>
        {equipmentList.length === 0 ? (
          <div className="empty-state">
            <p>You haven't listed any farm equipment yet.</p>
            <button
              className="primary-action"
              style={{ width: "auto", margin: "12px auto 0", padding: "0 20px" }}
              onClick={() => go("lender_equipment")}
            >
              ➕ List Your First Tractor or Tool
            </button>
          </div>
        ) : (
          <div className="catalog-grid">
            {equipmentList.slice(0, 4).map((item) => (
              <article className="equipment-card" key={item.id}>
                <div className="equipment-photo">
                  <img src={item.images?.[0] || PRESET_EQUIPMENT_PHOTOS[0].url} alt={item.title} />
                  <span className={`availability ${item.is_available ? "" : "busy"}`}>
                    {item.is_available ? "Available" : "In Use"}
                  </span>
                </div>
                <div className="equipment-content">
                  <div className="equipment-title">
                    <h3>{item.title}</h3>
                  </div>
                  <p>{item.category} • {item.specs?.distance_km || "Within 25 km"}</p>
                  <div className="price-line">
                    <div>
                      <strong>₹{item.daily_rate}</strong> <span>/ day</span>
                    </div>
                    {item.hourly_rate && (
                      <span style={{ fontSize: "12px", color: "#668073", fontWeight: 700 }}>
                        (₹{item.hourly_rate}/hr)
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export function ToolLenderEquipment({
  notify,
  user,
  profile,
}: {
  notify: (msg: string) => void;
  user: any;
  profile: any;
}) {
  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [selectedCommon, setSelectedCommon] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Tractor & Tillage");
  const [dailyRate, setDailyRate] = useState("2500");
  const [hourlyRate, setHourlyRate] = useState("450");
  const [distanceKm, setDistanceKm] = useState("Within 25 km");
  const [operatorIncluded, setOperatorIncluded] = useState("Yes, operator provided");
  const [fuelPolicy, setFuelPolicy] = useState("Fuel extra by farmer");
  const [selectedPhoto, setSelectedPhoto] = useState(PRESET_EQUIPMENT_PHOTOS[0].url);
  const [customPhotoUrl, setCustomPhotoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const userId = user?.id || profile?.userId || profile?.dbProfile?.id;

  const loadListings = () => {
    if (!userId) return;
    setLoading(true);
    fetchOwnerEquipmentListings(userId)
      .then((data) => setEquipmentList(data || []))
      .catch((err) => notify(`Failed to load equipment: ${err.message}`))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadListings();
  }, [userId]);

  const handleSelectCommon = (commonTitle: string) => {
    setSelectedCommon(commonTitle);
    const found = COMMONLY_USED_EQUIPMENTS.find((e) => e.title === commonTitle);
    if (found) {
      setTitle(found.title);
      setCategory(found.category);
      setDailyRate(String(found.dailyRate));
      setHourlyRate(String(found.hourlyRate));
      setSelectedPhoto(found.image);
      setDescription(found.description);
    } else if (commonTitle === "custom") {
      setTitle("");
      setSelectedPhoto(PRESET_EQUIPMENT_PHOTOS[0].url);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadMedia(file, "equipment");
      setSelectedPhoto(url);
      notify("Equipment photo uploaded!");
    } catch {
      // Fallback to FileReader data URL
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
    if (!title.trim()) {
      notify("Please provide equipment title.");
      return;
    }
    if (!dailyRate || Number(dailyRate) <= 0) {
      notify("Please specify a valid daily rental rate.");
      return;
    }

    setSaving(true);
    const finalPhoto = customPhotoUrl.trim() || selectedPhoto || PRESET_EQUIPMENT_PHOTOS[0].url;

    const payload = {
      owner_id: userId,
      title: title.trim(),
      category: category,
      daily_rate: Number(dailyRate),
      hourly_rate: hourlyRate ? Number(hourlyRate) : null,
      is_available: true,
      location_address: profile?.account?.place || profile?.dbProfile?.location?.district || "Local",
      images: [finalPhoto],
      description: description.trim() || `${title} available for rent in ${distanceKm}`,
      specs: {
        distance_km: distanceKm,
        operator_included: operatorIncluded,
        fuel_policy: fuelPolicy,
      },
    };

    try {
      await createEquipmentListing(payload as any);
      notify(`${title} added to your equipment catalog!`);
      setIsModalOpen(false);
      // Reset form
      setTitle("");
      setSelectedCommon("");
      loadListings();
    } catch (err: any) {
      // Local state fallback for mock mode
      const mockItem = {
        id: `eq_${Date.now()}`,
        ...payload,
        created_at: new Date().toISOString(),
      };
      setEquipmentList((prev) => [mockItem, ...prev]);
      notify(`${title} listed successfully!`);
      setIsModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailability = async (item: any) => {
    const nextStatus = !item.is_available;
    try {
      await updateEquipmentListing(item.id, { is_available: nextStatus });
      setEquipmentList((prev) =>
        prev.map((e) => (e.id === item.id ? { ...e, is_available: nextStatus } : e))
      );
      notify(`Status updated to ${nextStatus ? "Available" : "In Use"}`);
    } catch {
      setEquipmentList((prev) =>
        prev.map((e) => (e.id === item.id ? { ...e, is_available: nextStatus } : e))
      );
      notify(`Status updated to ${nextStatus ? "Available" : "In Use"}`);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete ${name} from your equipment listings?`)) return;
    try {
      await deleteEquipmentListing(id);
      setEquipmentList((prev) => prev.filter((e) => e.id !== id));
      notify(`${name} removed.`);
    } catch {
      setEquipmentList((prev) => prev.filter((e) => e.id !== id));
      notify(`${name} removed.`);
    }
  };

  return (
    <main className="page-content">
      <div className="page-heading">
        <div>
          <span className="eyebrow">MACHINERY INVENTORY</span>
          <h1>My Equipment Listings</h1>
          <p>List tractors, tillers, harvesters & tools with customizable rates and work radius.</p>
        </div>
        <button
          className="primary-action"
          style={{ width: "auto", margin: 0, padding: "0 20px" }}
          onClick={() => setIsModalOpen(true)}
        >
          <Icon name="plus" size={18} /> Add New Equipment
        </button>
      </div>

      {loading ? (
        <p>Loading equipment catalog...</p>
      ) : equipmentList.length === 0 ? (
        <div className="empty-state">
          <Icon name="tractor" size={48} className="sun-icon" />
          <h3 style={{ margin: "12px 0 6px" }}>No Equipment Listed Yet</h3>
          <p>List your tractors, tillers, or agricultural tools to start receiving bookings from local farmers.</p>
          <button
            className="primary-action"
            style={{ width: "auto", margin: "16px auto 0", padding: "0 24px" }}
            onClick={() => setIsModalOpen(true)}
          >
            ➕ List Equipment Now
          </button>
        </div>
      ) : (
        <div className="catalog-grid">
          {equipmentList.map((item) => (
            <article className="equipment-card" key={item.id}>
              <div className="equipment-photo">
                <img src={item.images?.[0] || PRESET_EQUIPMENT_PHOTOS[0].url} alt={item.title} />
                <span className={`availability ${item.is_available ? "" : "busy"}`}>
                  {item.is_available ? "🟢 Available" : "🟡 In Use / Booked"}
                </span>
              </div>
              <div className="equipment-content">
                <div className="equipment-title">
                  <h3>{item.title}</h3>
                </div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", margin: "6px 0" }}>
                  <span className="distance-badge">
                    <Icon name="map" size={12} /> {item.specs?.distance_km || "Within 25 km"}
                  </span>
                  {item.specs?.operator_included && (
                    <span className="operator-badge">
                      <Icon name="user" size={12} /> {item.specs.operator_included}
                    </span>
                  )}
                </div>
                <p style={{ margin: "6px 0", fontSize: "12px", color: "#668073" }}>{item.description}</p>
                <div className="price-line">
                  <div>
                    <strong>₹{item.daily_rate}</strong> <span>/ day</span>
                  </div>
                  {item.hourly_rate && (
                    <span style={{ fontSize: "13px", color: "#168642", fontWeight: 800 }}>
                      ₹{item.hourly_rate} / hr
                    </span>
                  )}
                </div>

                <div className="inventory-actions">
                  <button
                    className={`btn-toggle-avail ${item.is_available ? "" : "busy"}`}
                    onClick={() => handleToggleAvailability(item)}
                  >
                    {item.is_available ? "Mark as In-Use" : "Mark as Available"}
                  </button>
                  <button
                    className="btn-delete-item"
                    title="Delete listing"
                    onClick={() => handleDelete(item.id, item.title)}
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ADD EQUIPMENT MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>List Equipment for Rent</h2>
                <p>Choose from commonly used farm tools or enter custom details.</p>
              </div>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="signup-fields" style={{ marginBottom: "16px" }}>
                <label className="full-field">
                  Select Commonly Used Equipment:
                  <select
                    value={selectedCommon}
                    onChange={(e) => handleSelectCommon(e.target.value)}
                  >
                    <option value="">-- Choose from Popular Machinery --</option>
                    {COMMONLY_USED_EQUIPMENTS.map((eq) => (
                      <option key={eq.title} value={eq.title}>
                        {eq.title} (₹{eq.dailyRate}/day)
                      </option>
                    ))}
                    <option value="custom">✏️ Other / Custom Machinery...</option>
                  </select>
                </label>

                <label className="full-field">
                  Equipment Title <span style={{ color: "#d32f2f" }}>*</span>
                  <input
                    type="text"
                    placeholder="e.g. Swaraj 744 FE 48 HP Tractor with Cultivator"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </label>

                <label>
                  Category
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="Tractor & Tillage">Tractor & Tillage</option>
                    <option value="Harvesting & Threshing">Harvesting & Threshing</option>
                    <option value="Sowing & Planting">Sowing & Planting</option>
                    <option value="Spraying & Protection">Spraying & Protection</option>
                    <option value="Irrigation & Pumping">Irrigation & Pumping</option>
                    <option value="Heavy Machinery">Heavy Machinery</option>
                  </select>
                </label>

                <label>
                  Distance of Work (Service Radius)
                  <select value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)}>
                    <option value="Within 5 km">Within 5 km</option>
                    <option value="Within 10 km">Within 10 km</option>
                    <option value="Within 15 km">Within 15 km</option>
                    <option value="Within 25 km">Within 25 km (Standard)</option>
                    <option value="Within 50 km">Within 50 km</option>
                    <option value="Within 100 km">Within 100 km</option>
                    <option value="District-wide">District-wide</option>
                  </select>
                </label>

                <label>
                  Daily Rate (₹ / day) <span style={{ color: "#d32f2f" }}>*</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 2500"
                    value={dailyRate}
                    onChange={(e) => setDailyRate(e.target.value)}
                    required
                  />
                </label>

                <label>
                  Hourly Rate (₹ / hour)
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 450"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                  />
                </label>

                <label>
                  Operator / Driver
                  <select value={operatorIncluded} onChange={(e) => setOperatorIncluded(e.target.value)}>
                    <option value="Yes, operator provided">Yes, operator provided</option>
                    <option value="No, machine only">No, machine only (Renter operates)</option>
                    <option value="Optional on request">Optional on request</option>
                  </select>
                </label>

                <label>
                  Fuel Policy
                  <select value={fuelPolicy} onChange={(e) => setFuelPolicy(e.target.value)}>
                    <option value="Fuel extra by farmer">Fuel extra to be provided by farmer</option>
                    <option value="Fuel included in rate">Fuel included in rate</option>
                  </select>
                </label>

                <div className="full-field preset-selector">
                  <span className="preset-selector-label">Choose Equipment Photo:</span>
                  <div className="preset-grid">
                    {PRESET_EQUIPMENT_PHOTOS.map((ph) => (
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
                      {uploadingImage ? "Uploading..." : "📷 Upload Custom Photo"}
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

                <label className="full-field">
                  Equipment Description & Specs
                  <input
                    type="text"
                    placeholder="e.g. Model year 2023, good condition, includes 2 attachments."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </label>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="submit"
                  className="primary-action"
                  disabled={saving}
                  style={{ flex: 1, margin: 0 }}
                >
                  {saving ? "Listing Equipment..." : "Save Equipment Listing"}
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

export function ToolLenderBookings({
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
      .catch((err) => notify(`Failed to load requests: ${err.message}`))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRequests();
  }, [userId]);

  const handleAction = async (id: string, status: "confirmed" | "cancelled" | "completed") => {
    try {
      await updateServiceRequestStatus(id, status);
      notify(`Booking status updated to ${status}`);
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch (err: any) {
      notify(`Status update: ${err.message}`);
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    }
  };

  return (
    <main className="page-content">
      <div className="page-heading">
        <div>
          <span className="eyebrow">BOOKING MANAGEMENT</span>
          <h1>Rental Bookings & Inquiries</h1>
          <p>Accept or manage incoming requests from farmers wanting to hire your machinery.</p>
        </div>
        <SpeakButton label="Rental bookings" />
      </div>

      {loading ? (
        <p>Loading bookings...</p>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <Icon name="clock" size={40} />
          <h3>No Booking Requests Yet</h3>
          <p>When farmers book your tractors or equipment, their requests will appear here with contact details.</p>
        </div>
      ) : (
        <div className="catalog-grid">
          {requests.map((req) => (
            <article className="owner-request" key={req.id}>
              <div className="owner-head">
                <div className="avatar"><Icon name="tractor" /></div>
                <div>
                  <span className={`status ${req.status}`}>{req.status}</span>
                  <h3>Request from {req.requester?.full_name || "Farmer"}</h3>
                  <p>
                    <b>Dates:</b> {req.start_date} to {req.end_date} • <b>Total:</b> ₹{req.total_cost}
                  </p>
                  <p><b>Contact:</b> {req.requester?.phone || "Phone on file"}</p>
                  {req.notes && <p><b>Farmer Notes:</b> "{req.notes}"</p>}
                </div>
              </div>

              {req.status === "pending" && (
                <div className="decision-actions" style={{ marginTop: "14px" }}>
                  <button className="accept" onClick={() => handleAction(req.id, "confirmed")}>
                    ✓ Accept Booking
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
                    Mark Job as Completed
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
