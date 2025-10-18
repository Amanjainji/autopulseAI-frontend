const ACCESS_KEY = "autopulse.accessCodes";
const SESSION_KEY = "autopulse.session";

const DEFAULT_USERS = [
  {
    id: "CUST-001",
    name: "Amaan Jain",
    phone: "+91-98765-43210",
    email: "amaan.jain@autopulse.in",
    commodity: "Mahindra Scorpio N | Fleet operations",
    accessCode: "SCORP-4721",
    createdAt: new Date().toISOString(),
    channel: "web"
  },
  {
    id: "CUST-014",
    name: "Neha Menon",
    phone: "+91-98197-22445",
    email: "neha.menon@autopulse.in",
    commodity: "Tata Nexon EV | EV program",
    accessCode: "NEXON-8392",
    createdAt: new Date(Date.now() - 3600_000).toISOString(),
    channel: "mobile"
  }
];

function readJson(key, fallback){
  try{
    const raw = localStorage.getItem(key);
    if(!raw) return fallback;
    return JSON.parse(raw);
  }catch{
    return fallback;
  }
}

function writeJson(key, value){
  try{
    localStorage.setItem(key, JSON.stringify(value));
    if(typeof window !== "undefined"){
      window.dispatchEvent(new Event("autopulse:session"));
    }
  }catch{
    // ignore storage quota issues in demo
  }
}

export function seedAccessDirectory(){
  const existing = readJson(ACCESS_KEY, null);
  if(!existing || !Array.isArray(existing) || existing.length === 0){
    writeJson(ACCESS_KEY, DEFAULT_USERS);
    return DEFAULT_USERS;
  }
  return existing;
}

export function listRegisteredUsers(){
  return readJson(ACCESS_KEY, DEFAULT_USERS);
}

export function generateAccessCode(name = "FLEET"){
  const prefix = name?.split(" ")[0]?.slice(0, 5).toUpperCase() || "FLEET";
  const clean = prefix.replace(/[^A-Z0-9]/gi, "");
  const token = Math.floor(1000 + Math.random() * 9000);
  return `${clean}-${token}`;
}

export function registerUserProfile({ id, name, phone, email, commodity, channel = "web" }){
  const roster = listRegisteredUsers();
  const accessCode = generateAccessCode(name);
  const record = {
    id: id || `CUST-${String(roster.length + 1).padStart(3, "0")}`,
    name,
    phone,
    email,
    commodity,
    accessCode,
    channel,
    createdAt: new Date().toISOString()
  };
  roster.unshift(record);
  writeJson(ACCESS_KEY, roster);
  return record;
}

export function storeSession(session){
  writeJson(SESSION_KEY, session);
}

export function getSession(){
  return readJson(SESSION_KEY, null);
}

export function clearSession(){
  localStorage.removeItem(SESSION_KEY);
  if(typeof window !== "undefined"){
    window.dispatchEvent(new Event("autopulse:session"));
  }
}

export function validateUserLogin({ identifier, code }){
  const roster = listRegisteredUsers();
  const match = roster.find(entry => {
    const tokens = [entry.id, entry.phone, entry.email].filter(Boolean).map(v => v.toLowerCase());
    const ident = identifier?.toLowerCase();
    return entry.accessCode === code && ident && tokens.some(token => token === ident);
  });
  if(match){
    storeSession({ role: "user", userId: match.id, name: match.name, accessCode: match.accessCode });
    return match;
  }
  return null;
}

export function validateAdminLogin({ email, code }){
  const ADMIN_EMAIL = "admin@autopulse.in";
  const ADMIN_CODE = "ADMIN-8845";
  if(email?.toLowerCase() === ADMIN_EMAIL && code === ADMIN_CODE){
    storeSession({ role: "admin", email: ADMIN_EMAIL, name: "Operations Control" });
    return { email: ADMIN_EMAIL, name: "Operations Control" };
  }
  return null;
}
