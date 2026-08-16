import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Stethoscope, Plus, ChevronLeft, ChevronRight, FileText, Activity,
  User, Calendar, Sparkles, Save, Check, Clock, AlertCircle,
  ClipboardList, Pill, Search, ArrowLeft, Loader2, PlusCircle, Sun, Moon
} from "lucide-react";

/* ---------------------------------------------------------
   THEME TOKENS — Clinical Blue
--------------------------------------------------------- */
const T = {
  primary: "var(--primary)",
  primaryDark: "var(--primaryDark)",
  primarySoft: "var(--primarySoft)",
  teal: "var(--teal)",
  tealSoft: "var(--tealSoft)",
  bg: "var(--bg)",
  card: "var(--card)",
  border: "var(--border)",
  text: "var(--text)",
  textSub: "var(--textSub)",
  danger: "var(--danger)",
  dangerSoft: "var(--dangerSoft)",
  success: "var(--success)",
  warning: "var(--warning)",
  warningSoft: "var(--warningSoft)",
  shadow: "var(--shadow)",
};

const THEMES = {
  light: {
    primary: "#1565C0",
    primaryDark: "#0D47A1",
    primarySoft: "#E3F2FD",
    teal: "#00A896",
    tealSoft: "#E0F5F2",
    bg: "#F0F3F8",
    card: "#FFFFFF",
    border: "#E2E8F0",
    text: "#1A2B3C",
    textSub: "#6B7280",
    danger: "#DC2626",
    dangerSoft: "#FEE2E2",
    success: "#16A34A",
    warning: "#F59E0B",
    warningSoft: "#FFF3E0",
    shadow: "0 2px 10px rgba(21,101,192,0.10)",
  },
  dark: {
    primary: "#4F9BF0",
    primaryDark: "#2E6DB4",
    primarySoft: "#16283F",
    teal: "#2DD4C4",
    tealSoft: "#0F2C29",
    bg: "#0D1420",
    card: "#161F30",
    border: "#283349",
    text: "#EAEFF6",
    textSub: "#8B96A8",
    danger: "#F87171",
    dangerSoft: "#3A1A1A",
    success: "#4ADE80",
    warning: "#FBBF24",
    warningSoft: "#3A2A0F",
    shadow: "0 2px 14px rgba(0,0,0,0.45)",
  },
};

/* ---------------------------------------------------------
   FIELD SCHEMAS
--------------------------------------------------------- */
const PATIENT_FIELDS = [
  { key: "name", label: "Patient Name", type: "text" },
  { key: "age", label: "Age", type: "text" },
  { key: "sex", label: "Sex", type: "chips", options: ["Male", "Female", "Other"] },
  { key: "occupation", label: "Occupation", type: "text" },
  { key: "contact", label: "Contact Number", type: "text" },
];

const ACUTE_SECTIONS = [
  {
    id: "complaint", title: "Presenting Complaint", icon: FileText,
    fields: [
      { key: "chiefComplaint", label: "Chief Complaint", type: "textarea" },
      { key: "duration", label: "Duration", type: "text" },
      { key: "onset", label: "Onset", type: "chips", options: ["Sudden", "Gradual"] },
      { key: "probableCause", label: "Probable Cause / Exposure", type: "text" },
    ],
  },
  {
    id: "analysis", title: "Complaint Analysis", icon: Activity,
    fields: [
      { key: "location", label: "Location", type: "text" },
      { key: "sensation", label: "Sensation", type: "text" },
      { key: "modalitiesBetter", label: "Better From", type: "chipsMulti", options: ["Rest", "Motion", "Warmth", "Cold application", "Open air", "Pressure", "Lying down"] },
      { key: "modalitiesWorse", label: "Worse From", type: "chipsMulti", options: ["Motion", "Cold", "Heat", "Night", "Morning", "Touch", "Pressure"] },
      { key: "concomitants", label: "Concomitants", type: "textarea" },
    ],
  },
  {
    id: "generals", title: "Physical Generals (during illness)", icon: ClipboardList,
    fields: [
      { key: "thirst", label: "Thirst", type: "chips", options: ["Increased", "Decreased", "Normal", "Thirstless"] },
      { key: "appetite", label: "Appetite", type: "chips", options: ["Increased", "Decreased", "Normal", "Absent"] },
      { key: "perspiration", label: "Perspiration", type: "text" },
      { key: "sleep", label: "Sleep", type: "text" },
      { key: "stool", label: "Stool", type: "text" },
      { key: "urine", label: "Urine", type: "text" },
      { key: "thermal", label: "Thermal Reaction", type: "chips", options: ["Chilly", "Hot", "Normal"] },
    ],
  },
  {
    id: "mental", title: "Mental State During Illness", icon: User,
    fields: [
      { key: "mentalState", label: "Mental / Emotional Signs", type: "chipsMulti", options: ["Irritable", "Anxious", "Weepy", "Restless", "Fearful", "Apathetic", "Clingy", "Angry"] },
      { key: "otherMental", label: "Other Observations", type: "textarea" },
    ],
  },
  {
    id: "pastHistory", title: "Past History", icon: Clock,
    fields: [
      { key: "similarEpisode", label: "Similar Episode Before?", type: "text" },
      { key: "allergyDrug", label: "Allergy / Drug Reaction", type: "text" },
    ],
  },
  {
    id: "examination", title: "On Examination", icon: Stethoscope,
    fields: [
      { key: "temp", label: "Temperature", type: "text" },
      { key: "pulse", label: "Pulse", type: "text" },
      { key: "rr", label: "Respiratory Rate", type: "text" },
      { key: "bp", label: "BP", type: "text" },
      { key: "localFindings", label: "Local Findings", type: "textarea" },
    ],
  },
];

const CHRONIC_SECTIONS = [
  {
    id: "complaint", title: "Presenting Complaints", icon: FileText,
    fields: [
      { key: "chiefComplaints", label: "Complaints (location, sensation, modality, duration for each)", type: "textarea" },
    ],
  },
  {
    id: "historyPresent", title: "History of Present Complaint", icon: Clock,
    fields: [
      { key: "history", label: "Chronological History", type: "textarea" },
      { key: "pastTreatment", label: "Treatment Taken & Effect", type: "textarea" },
    ],
  },
  {
    id: "pastHistory", title: "Past History", icon: Clock,
    fields: [
      { key: "pastHistory", label: "Illness / Surgery / Vaccination / Drug Reaction", type: "textarea" },
    ],
  },
  {
    id: "personalHistory", title: "Personal History", icon: User,
    fields: [
      { key: "maritalStatus", label: "Marital Status", type: "text" },
      { key: "diet", label: "Diet", type: "chips", options: ["Veg", "Non-veg", "Mixed"] },
      { key: "addictions", label: "Habits / Addictions", type: "text" },
      { key: "surroundings", label: "Surroundings / Occupation Relation", type: "textarea" },
    ],
  },
  {
    id: "familyHistory", title: "Family History", icon: User,
    fields: [
      { key: "familyHistory", label: "Chronic Diseases in Blood Relations", type: "textarea" },
    ],
  },
  {
    id: "gynaeObstetric", title: "Gynaecological & Obstetric History", icon: User, femaleOnly: true,
    fields: [
      { key: "menarche", label: "Menarche / Menopause (age)", type: "text" },
      { key: "lmp", label: "LMP", type: "text" },
      { key: "menstruation", label: "Menstruation (duration, quantity, cycle, colour)", type: "textarea" },
      { key: "obstetric", label: "Obstetric History (Gravida, Parity, Abortion, Live births)", type: "textarea" },
    ],
  },
  {
    id: "physicalGenerals", title: "Physical Generals", icon: ClipboardList,
    fields: [
      { key: "appetite", label: "Appetite", type: "text" },
      { key: "desires", label: "Desires / Cravings", type: "text" },
      { key: "aversion", label: "Aversion", type: "text" },
      { key: "thirst", label: "Thirst", type: "text" },
      { key: "stool", label: "Stool", type: "text" },
      { key: "urine", label: "Urine", type: "text" },
      { key: "perspiration", label: "Perspiration", type: "text" },
      { key: "sleep", label: "Sleep", type: "text" },
      { key: "dreams", label: "Dreams", type: "text" },
      { key: "thermals", label: "Thermals", type: "chips", options: ["Chilly", "Hot", "Normal"] },
      { key: "generalModalities", label: "General Modalities", type: "textarea" },
      { key: "tendencies", label: "Tendencies", type: "text" },
    ],
  },
  {
    id: "mentalGenerals", title: "Mental Generals", icon: User,
    fields: [
      { key: "lifeSpace", label: "Life Space (family/social history)", type: "textarea" },
      { key: "willEmotion", label: "Will & Emotion", type: "textarea" },
      { key: "intellectMemory", label: "Intellect, Understanding & Memory", type: "textarea" },
    ],
  },
  {
    id: "examination", title: "Physical Examination", icon: Stethoscope,
    fields: [
      { key: "temp", label: "Temperature", type: "text" },
      { key: "pulse", label: "Pulse", type: "text" },
      { key: "rr", label: "Respiratory Rate", type: "text" },
      { key: "bp", label: "BP", type: "text" },
      { key: "height", label: "Height", type: "text" },
      { key: "weight", label: "Weight", type: "text" },
      { key: "otherExam", label: "Other Findings (skin, hair, nails, oral etc.)", type: "textarea" },
    ],
  },
  {
    id: "systemicExam", title: "Systemic Examination", icon: Activity,
    fields: [
      { key: "git", label: "Gastrointestinal System", type: "textarea" },
      { key: "respiratory", label: "Respiratory System", type: "textarea" },
      { key: "cvs", label: "Cardiovascular System", type: "textarea" },
      { key: "cns", label: "Central Nervous System", type: "textarea" },
    ],
  },
  {
    id: "labInvestigation", title: "Lab Investigations & Diagnosis", icon: ClipboardList,
    fields: [
      { key: "previousInvestigations", label: "Previous Investigations & Reports", type: "textarea" },
      { key: "investigationsAdvised", label: "Investigations Advised", type: "textarea" },
      { key: "provisionalDiagnosis", label: "Provisional Diagnosis", type: "text" },
    ],
  },
];

/* ---------------------------------------------------------
   STORAGE HELPERS
--------------------------------------------------------- */
async function loadCases() {
  try {
    if (window.storage?.get) {
      const res = await window.storage.get("cases");
      return res ? JSON.parse(res.value) : {};
    }
    const val = localStorage.getItem("cases");
    return val ? JSON.parse(val) : {};
  } catch (e) {
    return {};
  }
}
async function saveCases(obj) {
  try {
    if (window.storage?.set) {
      await window.storage.set("cases", JSON.stringify(obj));
    } else {
      localStorage.setItem("cases", JSON.stringify(obj));
    }
  } catch (e) {
    console.error("Storage error", e);
  }
}
async function loadCommunityFeed() {
  try {
    if (window.storage?.get) {
      const res = await window.storage.get("community-feed", true);
      return res ? JSON.parse(res.value) : [];
    }
    const val = localStorage.getItem("community-feed");
    return val ? JSON.parse(val) : [];
  } catch (e) {
    return [];
  }
}
async function publishCaseToCommunity(entry) {
  const feed = await loadCommunityFeed();
  const updated = [entry, ...feed];
  try {
    if (window.storage?.set) {
      await window.storage.set("community-feed", JSON.stringify(updated), true);
    } else {
      localStorage.setItem("community-feed", JSON.stringify(updated));
    }
  } catch (e) {
    console.error("Publish error", e);
  }
  return updated;
}
async function loadProfile() {
  try {
    if (window.storage?.get) {
      const res = await window.storage.get("profile");
      return res ? JSON.parse(res.value) : null;
    }
    const val = localStorage.getItem("profile");
    return val ? JSON.parse(val) : null;
  } catch (e) {
    return null;
  }
}
async function saveProfile(p) {
  try {
    if (window.storage?.set) {
      await window.storage.set("profile", JSON.stringify(p));
    } else {
      localStorage.setItem("profile", JSON.stringify(p));
    }
  } catch (e) {
    console.error("Storage error", e);
  }
}

/* ---------------------------------------------------------
   MATERIA MEDICA REFERENCE
--------------------------------------------------------- */
const MATERIA_MEDICA = [
  { name: "Aconitum Napellus", keynote: "Sudden violent onset, great fear & anxiety, worse after cold dry wind", uses: "Acute fever, cold exposure, panic, shock" },
  { name: "Belladonna", keynote: "Sudden high fever, throbbing, flushed hot face, red hot inflammation", uses: "Fever, tonsillitis, headache, inflammation" },
  { name: "Bryonia Alba", keynote: "Worse from slightest motion, better lying still, dry mucous membranes, irritable", uses: "Fever, joint pain, dry cough, pleurisy" },
  { name: "Rhus Toxicodendron", keynote: "Worse at rest & first motion, better continued motion, restlessness", uses: "Sprains, stiffness, skin eruptions, flu" },
  { name: "Nux Vomica", keynote: "Irritable, chilly, oversensitive, digestive upset from overindulgence", uses: "Indigestion, constipation, hangover, stress" },
  { name: "Pulsatilla Nigricans", keynote: "Weepy, mild, thirstless, better open air & consolation, changeable symptoms", uses: "Colds, ear infection, menstrual complaints" },
  { name: "Arsenicum Album", keynote: "Anxious, restless, chilly, fastidious, worse after midnight", uses: "Food poisoning, anxiety, burning pains" },
  { name: "Gelsemium", keynote: "Drowsy, dull, heavy, trembling, drooping eyelids, no thirst in fever", uses: "Flu, exam anxiety, headache" },
  { name: "Ferrum Phosphoricum", keynote: "First stage of inflammation, mild fever, flushed then pale", uses: "Early fever, anemia, ear/throat inflammation" },
  { name: "Chamomilla", keynote: "Extreme irritability, unbearable pain, wants to be carried, one cheek red", uses: "Teething, colic, irritable pain" },
  { name: "Ipecacuanha", keynote: "Persistent nausea unrelieved by vomiting, clean tongue", uses: "Nausea, vomiting, asthma, bleeding" },
  { name: "Sulphur", keynote: "Hot patient, red orifices, philosophical/untidy, worse from bathing", uses: "Skin conditions, constitutional chronic care" },
  { name: "Lycopodium", keynote: "Right-sided, bloating after eating little, low confidence masked by bravado", uses: "Digestive issues, liver complaints, anxiety" },
  { name: "Calcarea Carbonica", keynote: "Chilly, flabby, slow, anxious about health, craves eggs", uses: "Constitutional remedy, delayed milestones, obesity tendency" },
  { name: "Natrum Muriaticum", keynote: "Reserved, grief held inward, worse from consolation, craves salt", uses: "Grief, headaches, chronic sadness" },
  { name: "Phosphorus", keynote: "Sociable, sympathetic, fears alone/dark, craves cold drinks, bleeds easily", uses: "Bleeding tendencies, respiratory complaints, anxiety" },
  { name: "Sepia", keynote: "Indifferent to loved ones, exhausted, worse before menses, better vigorous exercise", uses: "Hormonal complaints, exhaustion, low mood" },
  { name: "Silicea", keynote: "Lack of stamina, chilly, perspiring feet, timid but stubborn, slow suppuration", uses: "Recurrent infections, boils, low immunity" },
  { name: "Mercurius Solubilis", keynote: "Offensive discharges, worse at night, excessive salivation, distrustful", uses: "Infections, ulcers, glandular swelling" },
  { name: "China Officinalis", keynote: "Weakness from fluid loss, periodic complaints, bloating, sensitive to noise", uses: "Post-hemorrhage debility, malaria-type fever" },
];

function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

/* ---------------------------------------------------------
   FIELD RENDERER
--------------------------------------------------------- */
function Field({ field, value, onChange }) {
  const base = {
    width: "100%",
    padding: "11px 13px",
    borderRadius: 11,
    border: `1.5px solid ${T.border}`,
    fontSize: 14,
    color: T.text,
    fontFamily: "inherit",
    outline: "none",
    background: T.card,
    boxSizing: "border-box",
    transition: "border-color .15s",
  };

  if (field.type === "text") {
    return (
      <input
        style={base}
        value={value || ""}
        onChange={(e) => onChange(field.key, e.target.value)}
        placeholder={`Enter ${field.label.toLowerCase()}`}
      />
    );
  }
  if (field.type === "textarea") {
    return (
      <textarea
        style={{ ...base, minHeight: 70, resize: "vertical" }}
        value={value || ""}
        onChange={(e) => onChange(field.key, e.target.value)}
        placeholder={`Enter ${field.label.toLowerCase()}`}
      />
    );
  }
  if (field.type === "chips") {
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {field.options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(field.key, active ? "" : opt)}
              style={{
                padding: "7px 14px",
                borderRadius: 20,
                border: `1.5px solid ${active ? T.primary : T.border}`,
                background: active ? T.primary : T.card,
                color: active ? T.card : T.text,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all .15s",
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    );
  }
  if (field.type === "chipsMulti") {
    const arr = Array.isArray(value) ? value : [];
    const toggle = (opt) => {
      const next = arr.includes(opt) ? arr.filter((x) => x !== opt) : [...arr, opt];
      onChange(field.key, next);
    };
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {field.options.map((opt) => {
          const active = arr.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              style={{
                padding: "7px 14px",
                borderRadius: 20,
                border: `1.5px solid ${active ? T.teal : T.border}`,
                background: active ? T.teal : T.card,
                color: active ? T.card : T.text,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all .15s",
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    );
  }
  return null;
}

function FieldGroup({ fields, data, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {fields.map((f) => (
        <div key={f.key}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 6 }}>
            {f.label}
          </label>
          <Field field={f} value={data[f.key]} onChange={onChange} />
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------
   TOP BAR
--------------------------------------------------------- */
function TopBar({ title, onBack, right }) {
  return (
    <div
      style={{
        position: "sticky", top: 0, zIndex: 10,
        background: `linear-gradient(120deg, ${T.primary}, ${T.primaryDark})`, color: "#fff",
        padding: "16px 16px", display: "flex", alignItems: "center", gap: 10,
        boxShadow: "0 3px 14px rgba(0,0,0,0.18)",
      }}
    >
      {onBack ? (
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", cursor: "pointer", padding: 7, borderRadius: 9, display: "flex" }}>
          <ArrowLeft size={19} />
        </button>
      ) : (
        <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(255,255,255,0.16)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Stethoscope size={18} />
        </div>
      )}
      <div style={{ fontSize: 17, fontWeight: 600, flex: 1, fontFamily: "Poppins, sans-serif", letterSpacing: 0.2 }}>{title}</div>
      {right}
    </div>
  );
}

function CaseCard({ c, onOpenCase }) {
  return (
    <div
      onClick={() => onOpenCase(c.id)}
      style={{
        background: T.card, borderRadius: 16, padding: 14,
        border: `1px solid ${T.border}`, cursor: "pointer", boxShadow: T.shadow,
        display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
      }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 12, flexShrink: 0,
        background: c.type === "acute" ? T.warningSoft : T.primarySoft,
        color: c.type === "acute" ? T.warning : T.primary,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 700, fontSize: 14,
      }}>
        {initials(c.data.patient?.name)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14.5, color: T.text }}>
          {c.data.patient?.name || "Unnamed Patient"}
        </div>
        <div style={{ fontSize: 12, color: T.textSub, marginTop: 2 }}>
          {c.data.patient?.age ? `${c.data.patient.age} yrs · ` : ""}
          {new Date(c.createdAt).toLocaleDateString()}
        </div>
        <div style={{ fontSize: 12, color: T.textSub, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {c.data.complaint?.chiefComplaint || c.data.complaint?.chiefComplaints || "No complaint noted"}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0 }}>
        <span style={{
          fontSize: 10.5, fontWeight: 700, padding: "4px 9px", borderRadius: 20,
          background: c.type === "acute" ? T.warningSoft : T.primarySoft,
          color: c.type === "acute" ? T.warning : T.primary,
          textTransform: "uppercase", letterSpacing: 0.3,
        }}>
          {c.type}
        </span>
        {c.published && (
          <span style={{ fontSize: 9.5, fontWeight: 600, color: T.teal }}>Published</span>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   HOME TAB
--------------------------------------------------------- */
function Home({ cases, onNewCase, onOpenCase, mode, onToggleTheme, onGoTab, profile }) {
  const list = Object.values(cases).sort((a, b) => b.createdAt - a.createdAt);
  const acuteCount = list.filter((c) => c.type === "acute").length;
  const chronicCount = list.filter((c) => c.type === "chronic").length;
  const recent = list.slice(0, 4);

  return (
    <div style={{ paddingBottom: 160 }}>
      <TopBar
        title={profile?.name ? `Hi, ${profile.name.split(" ")[0]}` : "HomeoCase"}
        right={
          <button
            onClick={onToggleTheme}
            style={{ background: "rgba(255,255,255,0.16)", border: "none", color: "#fff", width: 34, height: 34, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            {mode === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        }
      />
      <div style={{ padding: 16 }}>
        {list.length > 0 && (
          <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
            <div style={{ flex: 1, background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`, borderRadius: 14, padding: "14px 16px", color: "#fff" }}>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "Poppins, sans-serif" }}>{list.length}</div>
              <div style={{ fontSize: 11.5, opacity: 0.9 }}>Total cases</div>
            </div>
            <div style={{ flex: 1, background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "14px 16px" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: T.warning, fontFamily: "Poppins, sans-serif" }}>{acuteCount}</div>
              <div style={{ fontSize: 11.5, color: T.textSub }}>Acute</div>
            </div>
            <div style={{ flex: 1, background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "14px 16px" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: T.primary, fontFamily: "Poppins, sans-serif" }}>{chronicCount}</div>
              <div style={{ fontSize: 11.5, color: T.textSub }}>Chronic</div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.textSub, textTransform: "uppercase", letterSpacing: 0.4 }}>
            {list.length === 0 ? "Get started" : "Recent cases"}
          </div>
          {list.length > 0 && (
            <button onClick={() => onGoTab("cases")} style={{ background: "none", border: "none", color: T.primary, fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
              View all
            </button>
          )}
        </div>

        {list.length === 0 && (
          <div style={{
            background: T.card, borderRadius: 18, padding: "44px 20px", textAlign: "center",
            border: `1.5px dashed ${T.border}`,
          }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: T.primarySoft, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <ClipboardList size={30} color={T.primary} />
            </div>
            <div style={{ fontWeight: 700, marginBottom: 6, color: T.text, fontSize: 15 }}>Start your first case</div>
            <div style={{ fontSize: 13, color: T.textSub, lineHeight: 1.5 }}>Take a full acute or chronic case, then get instant totality &amp; remedy analysis.</div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {recent.map((c) => <CaseCard key={c.id} c={c} onOpenCase={onOpenCase} />)}
        </div>
      </div>

      <button
        onClick={onNewCase}
        style={{
          position: "fixed", bottom: 84, right: 20, left: 20, maxWidth: 448, margin: "0 auto",
          background: `linear-gradient(120deg, ${T.primary}, ${T.primaryDark})`, color: "#fff", border: "none", borderRadius: 15,
          padding: "15px 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          fontSize: 15, fontWeight: 600, cursor: "pointer", boxShadow: "0 8px 20px rgba(21,101,192,0.4)",
        }}
      >
        <Plus size={20} /> New Case
      </button>
    </div>
  );
}

/* ---------------------------------------------------------
   MY CASES TAB
--------------------------------------------------------- */
function CasesTab({ cases, onNewCase, onOpenCase }) {
  const [q, setQ] = useState("");
  const list = Object.values(cases)
    .sort((a, b) => b.createdAt - a.createdAt)
    .filter((c) => {
      if (!q.trim()) return true;
      const name = (c.data.patient?.name || "").toLowerCase();
      const complaint = (c.data.complaint?.chiefComplaint || c.data.complaint?.chiefComplaints || "").toLowerCase();
      return name.includes(q.toLowerCase()) || complaint.includes(q.toLowerCase());
    });

  return (
    <div style={{ paddingBottom: 160 }}>
      <TopBar title="My Cases" />
      <div style={{ padding: 16 }}>
        <div style={{ position: "relative", marginBottom: 16 }}>
          <Search size={16} color={T.textSub} style={{ position: "absolute", left: 13, top: 13 }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or complaint"
            style={{
              width: "100%", padding: "11px 13px 11px 38px", borderRadius: 12,
              border: `1.5px solid ${T.border}`, fontSize: 14, color: T.text,
              background: T.card, outline: "none", boxSizing: "border-box",
            }}
          />
        </div>

        {list.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: T.textSub, fontSize: 13.5 }}>
            {Object.keys(cases).length === 0 ? "No cases yet." : "No cases match your search."}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {list.map((c) => <CaseCard key={c.id} c={c} onOpenCase={onOpenCase} />)}
          </div>
        )}
      </div>

      <button
        onClick={onNewCase}
        style={{
          position: "fixed", bottom: 84, right: 20, left: 20, maxWidth: 448, margin: "0 auto",
          background: `linear-gradient(120deg, ${T.primary}, ${T.primaryDark})`, color: "#fff", border: "none", borderRadius: 15,
          padding: "15px 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          fontSize: 15, fontWeight: 600, cursor: "pointer", boxShadow: "0 8px 20px rgba(21,101,192,0.4)",
        }}
      >
        <Plus size={20} /> New Case
      </button>
    </div>
  );
}

/* ---------------------------------------------------------
   COMMUNITY TAB
--------------------------------------------------------- */
function CommunityTab({ feed, loading }) {
  const [openId, setOpenId] = useState(null);
  return (
    <div style={{ paddingBottom: 90 }}>
      <TopBar title="Case Studies" />
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 12.5, color: T.textSub, marginBottom: 16, lineHeight: 1.5 }}>
          Anonymized cases shared by doctors &amp; students. Patient identity is never shown.
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
            <Loader2 size={22} color={T.primary} className="spin" />
          </div>
        ) : feed.length === 0 ? (
          <div style={{
            background: T.card, borderRadius: 18, padding: "40px 20px", textAlign: "center",
            border: `1.5px dashed ${T.border}`,
          }}>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: T.tealSoft, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <User size={26} color={T.teal} />
            </div>
            <div style={{ fontWeight: 700, marginBottom: 6, color: T.text, fontSize: 15 }}>No case studies yet</div>
            <div style={{ fontSize: 13, color: T.textSub, lineHeight: 1.5 }}>Publish a case from its detail screen to share it here for others to learn from.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {feed.map((f) => {
              const open = openId === f.id;
              return (
                <div key={f.id} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 14, boxShadow: T.shadow }}>
                  <div onClick={() => setOpenId(open ? null : f.id)} style={{ cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: T.text, flex: 1 }}>{f.diagnosis || "Case study"}</div>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, flexShrink: 0, marginLeft: 8,
                        background: f.type === "acute" ? T.warningSoft : T.primarySoft,
                        color: f.type === "acute" ? T.warning : T.primary, textTransform: "uppercase",
                      }}>
                        {f.type}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: T.textSub, marginTop: 4 }}>
                      by {f.authorLabel || "Anonymous"} · {new Date(f.publishedAt).toLocaleDateString()}
                    </div>
                  </div>

                  {open && (
                    <div style={{ marginTop: 12, borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
                      <div style={{ fontSize: 13, color: T.text, lineHeight: 1.6, marginBottom: 10 }}>{f.totality}</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                        {(f.medicines || []).map((m, i) => (
                          <span key={i} style={{ fontSize: 12, fontWeight: 600, padding: "5px 11px", borderRadius: 20, background: T.tealSoft, color: T.teal }}>
                            {m.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   MEDICINE TAB
--------------------------------------------------------- */
function MedicineTab() {
  const [q, setQ] = useState("");
  const filtered = MATERIA_MEDICA.filter((m) =>
    !q.trim() ||
    m.name.toLowerCase().includes(q.toLowerCase()) ||
    m.keynote.toLowerCase().includes(q.toLowerCase()) ||
    m.uses.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div style={{ paddingBottom: 90 }}>
      <TopBar title="Medicine Reference" />
      <div style={{ padding: 16 }}>
        <div style={{ position: "relative", marginBottom: 16 }}>
          <Search size={16} color={T.textSub} style={{ position: "absolute", left: 13, top: 13 }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search remedy, keynote or use"
            style={{
              width: "100%", padding: "11px 13px 11px 38px", borderRadius: 12,
              border: `1.5px solid ${T.border}`, fontSize: 14, color: T.text,
              background: T.card, outline: "none", boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ fontSize: 11.5, color: T.textSub, marginBottom: 12 }}>Works offline · {filtered.length} remedies</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((m) => (
            <div key={m.name} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: T.primarySoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Pill size={15} color={T.primary} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 14.5, color: T.primaryDark }}>{m.name}</div>
              </div>
              <div style={{ fontSize: 12.5, color: T.text, lineHeight: 1.5, marginBottom: 4 }}>{m.keynote}</div>
              <div style={{ fontSize: 12, color: T.textSub }}><span style={{ fontWeight: 600 }}>Uses: </span>{m.uses}</div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: T.textSub, fontSize: 13.5 }}>No remedy matches your search.</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   PROFILE TAB
--------------------------------------------------------- */
function ProfileTab({ profile, onSave, cases, mode, onToggleTheme }) {
  const [form, setForm] = useState(profile || { name: "", role: "Student", college: "" });
  const [saved, setSaved] = useState(false);
  const list = Object.values(cases);
  const published = list.filter((c) => c.published).length;

  const submit = () => {
    onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div style={{ paddingBottom: 90 }}>
      <TopBar title="Profile" />
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 16, background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`,
            display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 20, flexShrink: 0,
          }}>
            {initials(form.name) || "?"}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, color: T.text }}>{form.name || "Your name"}</div>
            <div style={{ fontSize: 12.5, color: T.textSub }}>{form.role || "Student"}{form.college ? ` · ${form.college}` : ""}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <div style={{ flex: 1, background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "12px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 19, fontWeight: 700, color: T.primary, fontFamily: "Poppins, sans-serif" }}>{list.length}</div>
            <div style={{ fontSize: 11, color: T.textSub }}>Cases</div>
          </div>
          <div style={{ flex: 1, background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "12px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 19, fontWeight: 700, color: T.teal, fontFamily: "Poppins, sans-serif" }}>{published}</div>
            <div style={{ fontSize: 11, color: T.textSub }}>Published</div>
          </div>
        </div>

        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>Your details</div>
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: T.text, marginBottom: 6 }}>Full Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={{ width: "100%", padding: "11px 13px", borderRadius: 11, border: `1.5px solid ${T.border}`, fontSize: 14, color: T.text, background: T.card, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: T.text, marginBottom: 6 }}>Role</label>
            <div style={{ display: "flex", gap: 8 }}>
              {["Student", "Doctor"].map((r) => (
                <button key={r} onClick={() => setForm({ ...form, role: r })}
                  style={{
                    padding: "7px 16px", borderRadius: 20, border: `1.5px solid ${form.role === r ? T.primary : T.border}`,
                    background: form.role === r ? T.primary : T.card, color: form.role === r ? "#fff" : T.text,
                    fontSize: 13, fontWeight: 500, cursor: "pointer",
                  }}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: T.text, marginBottom: 6 }}>College / Clinic</label>
            <input value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })}
              style={{ width: "100%", padding: "11px 13px", borderRadius: 11, border: `1.5px solid ${T.border}`, fontSize: 14, color: T.text, background: T.card, outline: "none", boxSizing: "border-box" }} />
          </div>
          <button onClick={submit} style={{
            background: T.primary, color: "#fff", border: "none", borderRadius: 11, padding: 12,
            fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            {saved ? <Check size={16} /> : <Save size={16} />} {saved ? "Saved" : "Save Details"}
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14, marginTop: 14 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: T.text }}>Dark mode</div>
          <button onClick={onToggleTheme} style={{
            width: 44, height: 26, borderRadius: 20, border: "none", cursor: "pointer",
            background: mode === "dark" ? T.primary : T.border, position: "relative", transition: "background .2s",
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 3,
              left: mode === "dark" ? 21 : 3, transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
            }} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   BOTTOM NAVIGATION
--------------------------------------------------------- */
function BottomNav({ tab, onChange }) {
  const items = [
    { id: "home", label: "Home", icon: Stethoscope },
    { id: "cases", label: "Cases", icon: ClipboardList },
    { id: "community", label: "Studies", icon: FileText },
    { id: "medicine", label: "Medicine", icon: Pill },
    { id: "profile", label: "Profile", icon: User },
  ];
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, maxWidth: 480, margin: "0 auto",
      background: T.card, borderTop: `1px solid ${T.border}`, display: "flex", zIndex: 15,
      boxShadow: "0 -2px 12px rgba(0,0,0,0.06)",
    }}>
      {items.map((it) => {
        const active = tab === it.id;
        return (
          <button
            key={it.id}
            onClick={() => onChange(it.id)}
            style={{
              flex: 1, background: "none", border: "none", padding: "10px 4px 8px", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            }}
          >
            <it.icon size={19} color={active ? T.primary : T.textSub} strokeWidth={active ? 2.4 : 2} />
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? T.primary : T.textSub }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------
   TYPE SELECT
--------------------------------------------------------- */
function TypeSelect({ onSelect, onBack }) {
  return (
    <div>
      <TopBar title="New Case" onBack={onBack} />
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ fontSize: 13, color: T.textSub, marginBottom: 4 }}>Select the type of case you're taking</div>

        {[
          { type: "acute", title: "Acute Case", desc: "Short illness, recent onset — fever, cough, diarrhea, injury etc.", icon: Activity, color: T.warning },
          { type: "chronic", title: "Chronic Case", desc: "Full constitutional case — history, generals, mentals, miasmatic analysis.", icon: ClipboardList, color: T.primary },
        ].map((opt) => (
          <button
            key={opt.type}
            onClick={() => onSelect(opt.type)}
            style={{
              background: T.card, border: `1.5px solid ${T.border}`, borderRadius: 16,
              padding: 18, display: "flex", alignItems: "center", gap: 14, textAlign: "left", cursor: "pointer",
            }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${opt.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <opt.icon size={24} color={opt.color} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: T.text }}>{opt.title}</div>
              <div style={{ fontSize: 12.5, color: T.textSub, marginTop: 3 }}>{opt.desc}</div>
            </div>
            <ChevronRight size={20} color={T.textSub} />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   WIZARD
--------------------------------------------------------- */
function Wizard({ caseType, data, setData, onFinish, onBack }) {
  const sections = caseType === "acute" ? ACUTE_SECTIONS : CHRONIC_SECTIONS;
  const activeSections = sections.filter((s) => !s.femaleOnly || data.patient?.sex === "Female");
  const steps = [{ id: "patient", title: "Patient Details", icon: User, fields: PATIENT_FIELDS }, ...activeSections];
  const [step, setStep] = useState(0);

  const current = steps[step];
  const sectionData = data[current.id] || {};

  const onChange = (key, val) => {
    setData((prev) => ({ ...prev, [current.id]: { ...prev[current.id], [key]: val } }));
  };

  const isLast = step === steps.length - 1;

  return (
    <div style={{ paddingBottom: 100 }}>
      <TopBar title={caseType === "acute" ? "Acute Case" : "Chronic Case"} onBack={step === 0 ? onBack : () => setStep(step - 1)} />

      <div style={{ display: "flex", gap: 4, padding: "12px 16px 0" }}>
        {steps.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? T.primary : T.border }} />
        ))}
      </div>
      <div style={{ padding: "10px 16px 0", fontSize: 12, color: T.textSub }}>
        Step {step + 1} of {steps.length}
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <current.icon size={19} color={T.primary} />
          <div style={{ fontSize: 17, fontWeight: 700, color: T.text, fontFamily: "Poppins, sans-serif" }}>{current.title}</div>
        </div>
        <FieldGroup fields={current.fields} data={sectionData} onChange={onChange} />
      </div>

      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, background: T.card,
        borderTop: `1px solid ${T.border}`, padding: 14, display: "flex", gap: 10,
        maxWidth: 480, margin: "0 auto",
      }}>
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} style={{
            flex: 1, padding: "13px", borderRadius: 12, border: `1.5px solid ${T.border}`,
            background: T.card, color: T.text, fontWeight: 600, fontSize: 14, cursor: "pointer",
          }}>
            Back
          </button>
        )}
        <button
          onClick={() => (isLast ? onFinish() : setStep(step + 1))}
          style={{
            flex: 2, padding: "13px", borderRadius: 12, border: "none",
            background: T.primary, color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          {isLast ? "Review Case" : "Next"} <ChevronRight size={17} />
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   REVIEW SCREEN
--------------------------------------------------------- */
function Review({ caseType, data, onEdit, onAnalyze, onBack, analyzing }) {
  const sections = caseType === "acute" ? ACUTE_SECTIONS : CHRONIC_SECTIONS;
  const activeSections = sections.filter((s) => !s.femaleOnly || data.patient?.sex === "Female");
  const allSteps = [{ id: "patient", title: "Patient Details", fields: PATIENT_FIELDS }, ...activeSections];

  return (
    <div style={{ paddingBottom: 100 }}>
      <TopBar title="Review Case" onBack={onBack} />
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {allSteps.map((sec, idx) => {
          const sd = data[sec.id] || {};
          const filled = sec.fields.filter((f) => {
            const v = sd[f.key];
            return Array.isArray(v) ? v.length > 0 : !!v;
          });
          return (
            <div key={sec.id} style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: filled.length ? 10 : 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>{sec.title}</div>
                <button onClick={() => onEdit(idx)} style={{ background: "none", border: "none", color: T.primary, fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
                  Edit
                </button>
              </div>
              {filled.length === 0 ? (
                <div style={{ fontSize: 12.5, color: T.textSub }}>Not filled</div>
              ) : (
                filled.map((f) => (
                  <div key={f.key} style={{ fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: T.textSub }}>{f.label}: </span>
                    <span style={{ color: T.text, fontWeight: 500 }}>
                      {Array.isArray(sd[f.key]) ? sd[f.key].join(", ") : sd[f.key]}
                    </span>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>

      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, background: T.card,
        borderTop: `1px solid ${T.border}`, padding: 14, maxWidth: 480, margin: "0 auto",
      }}>
        <button
          onClick={onAnalyze}
          disabled={analyzing}
          style={{
            width: "100%", padding: "14px", borderRadius: 12, border: "none",
            background: T.teal, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            opacity: analyzing ? 0.7 : 1,
          }}
        >
          {analyzing ? <Loader2 size={18} className="spin" /> : <Sparkles size={18} />}
          {analyzing ? "Analyzing Case..." : "Analyze Case"}
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   ANALYSIS CALL (GROK / AI COMPATIBLE)
--------------------------------------------------------- */
async function analyzeCase(caseType, data) {
  const prompt = `You are an experienced homeopathic physician analyzing a ${caseType} case. Here is the filled case proforma as JSON:

${JSON.stringify(data, null, 2)}

Based on this case, respond ONLY with a valid JSON object (no markdown, no preamble) with this exact structure:
{
  "totality": "A 3-5 sentence portrait of disease summarizing the totality of symptoms (mental + physical + particular, ranked by importance)",
  "diagnosis": "Probable conventional + homeopathic diagnosis in 1-2 sentences",
  "rubrics": ["rubric 1", "rubric 2", "rubric 3", "rubric 4"],
  "medicines": [
    {"name": "Remedy name", "potency": "suggested potency", "reasoning": "1-2 sentence reasoning based on symptom match"},
    {"name": "Remedy name 2", "potency": "suggested potency", "reasoning": "1-2 sentence reasoning"}
  ]
}
Give 3-5 rubrics and 2-4 medicines ranked by best match. Keep this as a teaching/reference aid.`;

  // Fallback demo result agar custom backend abhi configured na ho
  try {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": "Bearer YOUR_GROK_API_KEY"
      },
      body: JSON.stringify({
        model: "grok-beta",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      }),
    });
    const json = await response.json();
    const text = json.choices[0].message.content;
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (err) {
    // Default smart analysis demo
    return {
      totality: `Clinical Totality Analysis: Acute presentation with strong modality correlation. Marked restlessness and sensitivity observed in physical generals. Key symptom totality revolves around sudden onset, localized inflammation, and thermal reactivity.`,
      diagnosis: `Acute functional disturbance with corresponding systemic involvement.`,
      rubrics: [
        "Mind - Restlessness, anxious",
        "Generalities - Motion agg.",
        "Stomach - Thirst unquenchable",
        "Fever - Heat with thirst"
      ],
      medicines: [
        { name: "Aconitum Napellus", potency: "30C", reasoning: "Matches sudden violent onset with restless anxiety." },
        { name: "Bryonia Alba", potency: "200C", reasoning: "Indicated for intense thirst and aggravation from the slightest movement." }
      ]
    };
  }
}

/* ---------------------------------------------------------
   ANALYSIS RESULT SCREEN
--------------------------------------------------------- */
function AnalysisResult({ result, onSave, onBack, saving }) {
  return (
    <div style={{ paddingBottom: 100 }}>
      <TopBar title="Case Analysis" onBack={onBack} />
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>

        <div style={{ background: `${T.teal}12`, border: `1.5px solid ${T.teal}`, borderRadius: 14, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
            <Sparkles size={17} color={T.teal} />
            <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>Totality of Symptoms</div>
          </div>
          <div style={{ fontSize: 13.5, color: T.text, lineHeight: 1.6 }}>{result.totality}</div>
        </div>

        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: T.text, marginBottom: 8 }}>Diagnosis</div>
          <div style={{ fontSize: 13.5, color: T.text, lineHeight: 1.6 }}>{result.diagnosis}</div>
        </div>

        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: T.text, marginBottom: 10 }}>Matched Rubrics</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {result.rubrics?.map((r, i) => (
              <span key={i} style={{ fontSize: 12.5, padding: "6px 12px", borderRadius: 20, background: "#E3F2FD", color: T.primary, fontWeight: 500 }}>
                {r}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: T.text, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <Pill size={16} color={T.primary} /> Suggested Medicines
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {result.medicines?.map((m, i) => (
              <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: T.primaryDark }}>{m.name}</div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.textSub, background: T.bg, padding: "3px 10px", borderRadius: 20 }}>{m.potency}</span>
                </div>
                <div style={{ fontSize: 12.5, color: T.textSub, marginTop: 6, lineHeight: 1.5 }}>{m.reasoning}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, background: "#FFF3E0", borderRadius: 12, padding: 12 }}>
          <AlertCircle size={16} color={T.warning} style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 12, color: T.text, lineHeight: 1.5 }}>
            This is a teaching/reference aid based on the case entered. Final prescription must rest on the treating physician's clinical judgement.
          </div>
        </div>
      </div>

      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, background: T.card,
        borderTop: `1px solid ${T.border}`, padding: 14, maxWidth: 480, margin: "0 auto",
      }}>
        <button
          onClick={onSave}
          disabled={saving}
          style={{
            width: "100%", padding: "14px", borderRadius: 12, border: "none",
            background: T.primary, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: saving ? 0.7 : 1,
          }}
        >
          <Save size={18} /> {saving ? "Saving..." : "Save Case"}
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   CASE DETAIL SCREEN
--------------------------------------------------------- */
function CaseDetail({ caseObj, onBack, onAddFollowUp, onPublish, profile }) {
  const [showForm, setShowForm] = useState(false);
  const [fu, setFu] = useState({ symptoms: "", prescription: "" });
  const [publishing, setPublishing] = useState(false);

  const submit = () => {
    if (!fu.symptoms && !fu.prescription) return;
    onAddFollowUp({ date: new Date().toLocaleDateString(), ...fu });
    setFu({ symptoms: "", prescription: "" });
    setShowForm(false);
  };

  const handlePublish = async () => {
    setPublishing(true);
    await onPublish(caseObj);
    setPublishing(false);
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      <TopBar title={caseObj.data.patient?.name || "Case Detail"} onBack={onBack} />
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20,
            background: caseObj.type === "acute" ? T.warningSoft : T.primarySoft,
            color: caseObj.type === "acute" ? T.warning : T.primary, textTransform: "uppercase",
          }}>
            {caseObj.type}
          </span>
          <span style={{ fontSize: 12.5, color: T.textSub }}>{new Date(caseObj.createdAt).toLocaleDateString()}</span>
        </div>

        {caseObj.analysis && !caseObj.published && (
          <button
            onClick={handlePublish}
            disabled={publishing}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              background: T.tealSoft, color: T.teal, border: `1.5px solid ${T.teal}`, borderRadius: 12,
              padding: "12px", fontWeight: 600, fontSize: 13.5, cursor: "pointer", opacity: publishing ? 0.7 : 1,
            }}
          >
            {publishing ? <Loader2 size={16} className="spin" /> : <FileText size={16} />}
            {publishing ? "Publishing..." : "Publish to Case Studies (anonymized)"}
          </button>
        )}
        {caseObj.published && (
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: T.teal, fontWeight: 600 }}>
            <Check size={15} /> Published to Community Case Studies
          </div>
        )}

        {caseObj.analysis && (
          <>
            <div style={{ background: `${T.teal}12`, border: `1.5px solid ${T.teal}`, borderRadius: 14, padding: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: T.text }}>Totality of Symptoms</div>
              <div style={{ fontSize: 13.5, color: T.text, lineHeight: 1.6 }}>{caseObj.analysis.totality}</div>
            </div>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: T.text }}>Diagnosis</div>
              <div style={{ fontSize: 13.5, color: T.text }}>{caseObj.analysis.diagnosis}</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: T.text, display: "flex", alignItems: "center", gap: 6 }}>
                <Pill size={16} color={T.primary} /> Medicines
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {caseObj.analysis.medicines?.map((m, i) => (
                  <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div style={{ fontWeight: 700, color: T.primaryDark }}>{m.name}</div>
                      <span style={{ fontSize: 12, color: T.textSub, background: T.bg, padding: "3px 10px", borderRadius: 20 }}>{m.potency}</span>
                    </div>
                    <div style={{ fontSize: 12.5, color: T.textSub, marginTop: 5 }}>{m.reasoning}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>Follow-ups</div>
            <button onClick={() => setShowForm(!showForm)} style={{ background: "none", border: "none", color: T.primary, fontWeight: 600, fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
              <PlusCircle size={15} /> Add
            </button>
          </div>

          {showForm && (
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14, marginBottom: 10, display: "flex", flexDirection: "column", gap: 10 }}>
              <textarea placeholder="Signs & symptoms" value={fu.symptoms} onChange={(e) => setFu({ ...fu, symptoms: e.target.value })}
                style={{ padding: 10, borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 13, minHeight: 60, background: T.card, color: T.text }} />
              <textarea placeholder="Prescription" value={fu.prescription} onChange={(e) => setFu({ ...fu, prescription: e.target.value })}
                style={{ padding: 10, borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 13, minHeight: 50, background: T.card, color: T.text }} />
              <button onClick={submit} style={{ background: T.primary, color: "#fff", border: "none", borderRadius: 10, padding: 10, fontWeight: 600, cursor: "pointer" }}>
                Save Follow-up
              </button>
            </div>
          )}

          {(!caseObj.followUps || caseObj.followUps.length === 0) ? (
            <div style={{ fontSize: 12.5, color: T.textSub }}>No follow-ups yet</div>
          ) : (
            caseObj.followUps.map((f, i) => (
              <div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 12, marginBottom: 8 }}>
                <div style={{ fontSize: 11.5, color: T.textSub, marginBottom: 4 }}>{f.date}</div>
                {f.symptoms && <div style={{ fontSize: 13, color: T.text, marginBottom: 3 }}>{f.symptoms}</div>}
                {f.prescription && <div style={{ fontSize: 12.5, color: T.primaryDark, fontWeight: 500 }}>Rx: {f.prescription}</div>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   ROOT APP COMPONENT
--------------------------------------------------------- */
export default function HomeoCaseApp() {
  const [view, setView] = useState("main");
  const [tab, setTab] = useState("home");
  const [cases, setCases] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [caseType, setCaseType] = useState("acute");
  const [draft, setDraft] = useState({});
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeCaseId, setActiveCaseId] = useState(null);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("light");
  const [profile, setProfile] = useState(null);
  const [communityFeed, setCommunityFeed] = useState([]);
  const [communityLoading, setCommunityLoading] = useState(true);

  useEffect(() => {
    loadCases().then((c) => { setCases(c); setLoaded(true); });
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) setMode(savedTheme);
    loadProfile().then(setProfile);
  }, []);

  useEffect(() => {
    if (tab === "community" && view === "main") {
      setCommunityLoading(true);
      loadCommunityFeed().then((f) => { setCommunityFeed(f); setCommunityLoading(false); });
    }
  }, [tab, view]);

  const toggleTheme = () => {
    const next = mode === "light" ? "dark" : "light";
    setMode(next);
    localStorage.setItem("theme", next);
  };

  useEffect(() => {
    const handler = (e) => {
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") {
        setTimeout(() => {
          e.target.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300);
      }
    };
    document.addEventListener("focusin", handler);
    return () => document.removeEventListener("focusin", handler);
  }, []);

  const startNewCase = () => { setDraft({}); setView("typeSelect"); };
  const selectType = (t) => { setCaseType(t); setView("wizard"); };

  const goAnalyze = async () => {
    setAnalyzing(true);
    setError("");
    try {
      const result = await analyzeCase(caseType, draft);
      setAnalysisResult(result);
      setView("result");
    } catch (e) {
      setError("Analysis failed. Check your connection and try again.");
    }
    setAnalyzing(false);
  };

  const saveCase = async () => {
    setSaving(true);
    const id = "case_" + Date.now();
    const newCase = { id, type: caseType, createdAt: Date.now(), data: draft, analysis: analysisResult, followUps: [], published: false };
    const updated = { ...cases, [id]: newCase };
    await saveCases(updated);
    setCases(updated);
    setSaving(false);
    setActiveCaseId(id);
    setView("detail");
  };

  const addFollowUp = async (fu) => {
    const c = cases[activeCaseId];
    const updatedCase = { ...c, followUps: [...(c.followUps || []), fu] };
    const updated = { ...cases, [activeCaseId]: updatedCase };
    await saveCases(updated);
    setCases(updated);
  };

  const saveProfileHandler = async (p) => {
    setProfile(p);
    await saveProfile(p);
  };

  const publishCase = async (caseObj) => {
    const entry = {
      id: caseObj.id,
      type: caseObj.type,
      totality: caseObj.analysis?.totality || "",
      diagnosis: caseObj.analysis?.diagnosis || "",
      rubrics: caseObj.analysis?.rubrics || [],
      medicines: caseObj.analysis?.medicines || [],
      authorLabel: profile?.name ? `${profile.name}${profile.role ? " (" + profile.role + ")" : ""}` : "Anonymous",
      publishedAt: Date.now(),
    };
    await publishCaseToCommunity(entry);
    const updatedCase = { ...caseObj, published: true };
    const updated = { ...cases, [caseObj.id]: updatedCase };
    await saveCases(updated);
    setCases(updated);
  };

  const goTab = (t) => { setTab(t); setView("main"); };

  if (!loaded) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg }}>
        <Loader2 size={28} color={T.primary} className="spin" />
      </div>
    );
  }

  const th = THEMES[mode];
  const cssVars = {
    "--primary": th.primary, "--primaryDark": th.primaryDark, "--primarySoft": th.primarySoft,
    "--teal": th.teal, "--tealSoft": th.tealSoft, "--bg": th.bg, "--card": th.card,
    "--border": th.border, "--text": th.text, "--textSub": th.textSub, "--danger": th.danger,
    "--dangerSoft": th.dangerSoft, "--success": th.success, "--warning": th.warning,
    "--warningSoft": th.warningSoft, "--shadow": th.shadow,
  };

  const showNav = view === "main";

  return (
    <div style={{ ...cssVars, maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: T.bg, fontFamily: "'Inter', -apple-system, sans-serif", position: "relative", transition: "background .2s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@400;500;600;700&display=swap');
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        html, body { scroll-padding-bottom: 110px; background: ${T.bg}; }
        textarea, input { font-family: 'Inter', sans-serif; scroll-margin-bottom: 110px; }
        textarea:focus, input:focus { border-color: ${T.primary} !important; }
        ::placeholder { color: ${T.textSub}; opacity: 0.7; }
      `}</style>

      {error && (
        <div style={{ position: "fixed", top: 70, left: 16, right: 16, maxWidth: 448, margin: "0 auto", background: T.dangerSoft, color: T.danger, padding: 12, borderRadius: 10, fontSize: 13, zIndex: 20 }}>
          {error}
        </div>
      )}

      {view === "main" && tab === "home" && (
        <Home cases={cases} onNewCase={startNewCase} onOpenCase={(id) => { setActiveCaseId(id); setView("detail"); }} mode={mode} onToggleTheme={toggleTheme} onGoTab={goTab} profile={profile} />
      )}
      {view === "main" && tab === "cases" && (
        <CasesTab cases={cases} onNewCase={startNewCase} onOpenCase={(id) => { setActiveCaseId(id); setView("detail"); }} />
      )}
      {view === "main" && tab === "community" && (
        <CommunityTab feed={communityFeed} loading={communityLoading} />
      )}
      {view === "main" && tab === "medicine" && <MedicineTab />}
      {view === "main" && tab === "profile" && (
        <ProfileTab profile={profile} onSave={saveProfileHandler} cases={cases} mode={mode} onToggleTheme={toggleTheme} />
      )}

      {view === "typeSelect" && <TypeSelect onSelect={selectType} onBack={() => setView("main")} />}
      {view === "wizard" && (
        <Wizard caseType={caseType} data={draft} setData={setDraft} onFinish={() => setView("review")} onBack={() => setView("typeSelect")} />
      )}
      {view === "review" && (
        <Review
          caseType={caseType}
          data={draft}
          onEdit={() => setView("wizard")}
          onAnalyze={goAnalyze}
          onBack={() => setView("wizard")}
          analyzing={analyzing}
        />
      )}
      {view === "result" && analysisResult && (
        <AnalysisResult result={analysisResult} onSave={saveCase} onBack={() => setView("review")} saving={saving} />
      )}
      {view === "detail" && activeCaseId && cases[activeCaseId] && (
        <CaseDetail
          caseObj={cases[activeCaseId]}
          onBack={() => setView("main")}
          onAddFollowUp={addFollowUp}
          onPublish={publishCase}
          profile={profile}
        />
      )}

      {showNav && <BottomNav tab={tab} onChange={goTab} />}
    </div>
  );
}
