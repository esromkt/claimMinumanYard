import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  signInWithCustomToken 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  addDoc,
  updateDoc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp,
  orderBy,
  runTransaction,
  deleteDoc
} from 'firebase/firestore';
import { 
  Coffee, 
  ClipboardList, 
  Users, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  LogOut,
  Package,
  Search,
  MapPin,
  Home,
  ShoppingBag,
  Clock,
  CupSoda,
  Droplet,
  Settings,
  ArrowLeft,
  Shield,
  Building2,
  Filter,
  Ticket
} from 'lucide-react';

// --- Firebase Config ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app';

// --- Helpers ---
const formatDate = (date) => date.toISOString().split('T')[0];
const getTodayString = () => formatDate(new Date());

const LOCATIONS = ['Yard Cakung', 'Yard Sukapura', 'Yard Jababeka'];

// --- Components ---

// 1. Mobile Wrapper
const MobileWrapper = ({ children, className = "" }) => (
  <div className="min-h-screen bg-gray-900 flex justify-center items-center font-sans">
    <div className={`w-full max-w-md h-[100dvh] bg-gray-50 flex flex-col relative overflow-hidden shadow-2xl md:rounded-3xl ${className}`}>
      {children}
    </div>
  </div>
);

// 2. Coupon Modal (NEW COMPONENT)
const CouponModal = ({ data, onClose }) => {
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xs rounded-3xl overflow-hidden relative shadow-2xl transform transition-all scale-100 animate-in zoom-in-95 duration-300">
        
        {/* Header Pattern */}
        <div className="bg-blue-600 h-32 relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-blue-600 to-blue-600"></div>
            <Ticket className="text-white/20 w-32 h-32 absolute -bottom-8 -right-8 rotate-12" />
            <div className="text-center z-10">
                <div className="bg-white/20 p-3 rounded-full inline-block mb-2 backdrop-blur-sm">
                  <Coffee className="text-white" size={32} />
                </div>
                <h3 className="text-white font-bold text-xl tracking-wider">KUPON KLAIM</h3>
                <p className="text-blue-100 text-[10px] tracking-[0.2em] uppercase">SiapMinum Yard</p>
            </div>
        </div>

        {/* Content */}
        <div className="p-6 pt-8 text-center relative bg-white">
            {/* Cutout circles for ticket effect */}
            <div className="absolute -top-3 -left-3 w-6 h-6 bg-gray-900 rounded-full shadow-inner"></div>
            <div className="absolute -top-3 -right-3 w-6 h-6 bg-gray-900 rounded-full shadow-inner"></div>
            
            {/* Dotted Line */}
            <div className="absolute top-0 left-3 right-3 border-t-2 border-dashed border-gray-300"></div>

            <div className="mb-6">
                <p className="text-gray-400 text-[10px] uppercase font-bold mb-1 tracking-wider">Item Minuman</p>
                <h2 className="text-2xl font-black text-slate-800 leading-tight">{data.drinkName}</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-left bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                    <p className="text-gray-400 text-[9px] uppercase font-bold">Lokasi</p>
                    <p className="font-bold text-xs text-slate-700">{data.location}</p>
                </div>
                <div>
                    <p className="text-gray-400 text-[9px] uppercase font-bold">Tanggal</p>
                    <p className="font-bold text-xs text-slate-700">{data.date}</p>
                </div>
            </div>

            {/* Status Stamp */}
            <div className="border-2 border-dashed border-yellow-400 bg-yellow-50/50 rounded-xl p-4 mb-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-yellow-400/5 rotate-12 scale-150"></div>
                <p className="text-[10px] text-yellow-600 font-bold uppercase tracking-widest relative z-10">Status Kupon</p>
                <div className="text-2xl font-black text-yellow-500 uppercase tracking-[0.2em] mt-1 relative z-10">
                    PENDING
                </div>
                <p className="text-[10px] text-yellow-600/70 mt-1 relative z-10">Menunggu Approval Admin</p>
            </div>

            <p className="text-[10px] text-gray-400 mb-4 px-4 leading-relaxed">
              Tunjukkan kupon ini ke petugas pantry setelah status berubah menjadi <span className="text-green-600 font-bold">APPROVED</span>.
            </p>

            <button 
                onClick={onClose}
                className="w-full bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-slate-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
                <span>Tutup & Cek Riwayat</span>
            </button>
        </div>
      </div>
    </div>
  );
};

// 3. Login Screen
const LoginScreen = ({ onLogin }) => {
  const [view, setView] = useState('main'); // main, area_select, role_select_area
  const [selectedLocation, setSelectedLocation] = useState('');

  const handleLocationSelect = (loc) => {
    setSelectedLocation(loc);
    setView('role_select_area');
  };

  return (
    <MobileWrapper className="bg-gradient-to-br from-slate-800 to-indigo-900">
      <div className="flex-1 flex flex-col justify-center px-8 relative z-10">
        
        {/* Logo Section */}
        <div className="bg-white/10 backdrop-blur-md w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-xl mx-auto border border-white/10">
          <Coffee size={48} className="text-blue-300" />
        </div>
        <h1 className="text-3xl font-bold text-white text-center mb-2">SiapMinum</h1>
        <p className="text-blue-200 mb-10 text-center text-sm opacity-80">Sistem Manajemen Logistik Yard</p>

        {view === 'main' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Login General Admin */}
            <button
              onClick={() => onLogin('admin_general', 'Kantor Pusat')}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white p-4 rounded-2xl font-bold shadow-lg flex items-center gap-4 active:scale-95 transition-transform border border-orange-400/50"
            >
              <div className="bg-white/20 p-2 rounded-xl">
                <Shield size={24} />
              </div>
              <div className="text-left">
                <div className="text-lg">Admin General</div>
                <div className="text-xs text-orange-100">Akses penuh semua area</div>
              </div>
            </button>

            <div className="flex items-center gap-2 text-white/30 text-xs py-2">
              <div className="h-px bg-white/20 flex-1"></div>
              ATAU
              <div className="h-px bg-white/20 flex-1"></div>
            </div>

            {/* Login Area / Employee */}
            <button
              onClick={() => setView('area_select')}
              className="w-full bg-white/10 hover:bg-white/20 text-white p-4 rounded-2xl font-bold border border-white/10 flex items-center gap-4 active:scale-95 transition-transform"
            >
              <div className="bg-blue-500/20 p-2 rounded-xl">
                <MapPin size={24} className="text-blue-300" />
              </div>
              <div className="text-left">
                <div className="text-lg">Masuk per Area</div>
                <div className="text-xs text-blue-200">Karyawan & Admin Area</div>
              </div>
            </button>
          </div>
        )}

        {view === 'area_select' && (
          <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-500">
             <button onClick={() => setView('main')} className="text-white/60 mb-2 flex items-center gap-2 text-sm hover:text-white"><ArrowLeft size={16}/> Kembali</button>
             <h2 className="text-white font-bold text-lg mb-4">Pilih Wilayah Kerja</h2>
             {LOCATIONS.map((loc) => (
              <button
                key={loc}
                onClick={() => handleLocationSelect(loc)}
                className="w-full bg-slate-700/50 hover:bg-slate-700 text-white p-4 rounded-2xl font-bold border border-white/5 flex items-center justify-between transition-all active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="text-indigo-400" size={20} />
                  <span>{loc}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {view === 'role_select_area' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <button onClick={() => setView('area_select')} className="text-white/60 mb-2 flex items-center gap-2 text-sm hover:text-white"><ArrowLeft size={16}/> Ganti Area</button>
            
            <div className="bg-indigo-500/20 p-4 rounded-xl border border-indigo-500/30 mb-2">
              <span className="text-xs text-indigo-200 block">Area Terpilih:</span>
              <span className="text-white font-bold flex items-center gap-2 text-lg">
                <MapPin size={18} className="text-yellow-400"/> {selectedLocation}
              </span>
            </div>

            <button
              onClick={() => onLogin('employee', selectedLocation)}
              className="w-full bg-white text-slate-800 p-4 rounded-2xl font-bold shadow-lg flex items-center gap-4 group active:scale-95 transition-transform"
            >
              <div className="bg-slate-100 p-2 rounded-xl">
                <Users size={24} className="text-slate-600" />
              </div>
              <div className="text-left">
                <div className="text-lg">Karyawan</div>
                <div className="text-xs text-slate-500">Klaim jatah harian</div>
              </div>
            </button>

            <button
              onClick={() => onLogin('admin_area', selectedLocation)}
              className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-bold border border-indigo-500 flex items-center gap-4 active:scale-95 transition-transform shadow-lg shadow-indigo-900/50"
            >
              <div className="bg-white/20 p-2 rounded-xl">
                <Settings size={24} />
              </div>
              <div className="text-left">
                <div className="text-lg">Admin Area</div>
                <div className="text-xs text-indigo-200">Kelola stok {selectedLocation}</div>
              </div>
            </button>
          </div>
        )}

      </div>
    </MobileWrapper>
  );
};

// 4. Admin Dashboard
const AdminDashboard = ({ user, role, location, logout }) => {
  const [activeTab, setActiveTab] = useState('approvals');
  const [inventory, setInventory] = useState([]);
  const [pendingClaims, setPendingClaims] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemStock, setNewItemStock] = useState(0);
  const isGeneral = role === 'admin_general';

  // Fetch Inventory (Global)
  useEffect(() => {
    if (!user) return;
    return onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'inventory'), (snap) => {
      setInventory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, [user]);

  // Fetch Claims (Filtered by Role)
  useEffect(() => {
    if (!user) return;
    
    let q;
    if (isGeneral) {
      // General Admin: View ALL pending claims
      q = query(
        collection(db, 'artifacts', appId, 'public', 'data', 'claims'),
        where('status', '==', 'pending'),
        orderBy('timestamp', 'desc')
      );
    } else {
      // Area Admin: View ONLY claims for their location
      q = query(
        collection(db, 'artifacts', appId, 'public', 'data', 'claims'),
        where('status', '==', 'pending'),
        where('location', '==', location),
        orderBy('timestamp', 'desc')
      );
    }

    const unsub = onSnapshot(q, (snap) => {
      setPendingClaims(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      // Fallback
      if (error.code === 'failed-precondition') {
         const basicQ = query(
            collection(db, 'artifacts', appId, 'public', 'data', 'claims'),
            where('status', '==', 'pending')
         );
         onSnapshot(basicQ, (snap) => {
            const allPending = snap.docs.map(d => ({id:d.id, ...d.data()}));
            if (isGeneral) {
                setPendingClaims(allPending.sort((a,b) => b.timestamp - a.timestamp));
            } else {
                setPendingClaims(allPending.filter(c => c.location === location).sort((a,b) => b.timestamp - a.timestamp));
            }
         });
      }
    });
    return () => unsub && unsub();
  }, [user, isGeneral, location]);

  const handleAddInventory = async (e) => {
    e.preventDefault();
    if (!newItemName) return;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'inventory'), {
      name: newItemName,
      warehouseStock: parseInt(newItemStock),
      createdAt: serverTimestamp()
    });
    setNewItemName(''); setNewItemStock(0);
  };

  const processClaim = async (claim, isApproved) => {
    try {
      if (isApproved) {
        await runTransaction(db, async (t) => {
          const claimRef = doc(db, 'artifacts', appId, 'public', 'data', 'claims', claim.id);
          t.update(claimRef, { status: 'approved', processedAt: serverTimestamp(), processedBy: isGeneral ? 'General Admin' : `Admin ${location}` });
          
          const invRef = doc(db, 'artifacts', appId, 'public', 'data', 'inventory', claim.inventoryId);
          const invDoc = await t.get(invRef);
          if (invDoc.exists()) {
            t.update(invRef, { warehouseStock: Math.max(0, invDoc.data().warehouseStock - 1) });
          }
        });
      } else {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'claims', claim.id), {
          status: 'rejected', processedAt: serverTimestamp(), processedBy: isGeneral ? 'General Admin' : `Admin ${location}`
        });
      }
    } catch (e) { console.error(e); }
  };

  return (
    <MobileWrapper>
      {/* Header Admin */}
      <div className={`${isGeneral ? 'bg-orange-700' : 'bg-indigo-900'} text-white p-6 pt-10 rounded-b-[2.5rem] shadow-lg z-10 flex-shrink-0 transition-colors duration-500`}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="flex items-center gap-2">
              {isGeneral ? <Shield size={20} className="text-orange-300"/> : <MapPin size={20} className="text-indigo-300"/>}
              <h2 className="text-xl font-bold">{isGeneral ? 'Admin Pusat' : 'Admin Area'}</h2>
            </div>
            <p className={`text-sm mt-1 ${isGeneral ? 'text-orange-200' : 'text-indigo-200'}`}>
              {isGeneral ? 'Otoritas: Semua Yard' : location}
            </p>
          </div>
          <button onClick={logout} className="bg-white/20 p-2 rounded-full hover:bg-white/30 backdrop-blur-sm">
            <LogOut size={18} />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setActiveTab('approvals')}
            className={`p-4 rounded-2xl flex flex-col items-start gap-2 transition-all ${activeTab === 'approvals' ? 'bg-white text-slate-800 shadow-lg' : 'bg-white/10 text-white'}`}
          >
            <div className="flex justify-between w-full">
              <CheckCircle size={24} />
              {pendingClaims.length > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">{pendingClaims.length}</span>}
            </div>
            <span className="font-bold text-sm">Approval {isGeneral ? 'Semua' : 'Area'}</span>
          </button>
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`p-4 rounded-2xl flex flex-col items-start gap-2 transition-all ${activeTab === 'inventory' ? 'bg-white text-slate-800 shadow-lg' : 'bg-white/10 text-white'}`}
          >
            <Package size={24} />
            <span className="font-bold text-sm">Master Stok</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-20 bg-slate-50">
        {activeTab === 'approvals' && (
          <div className="space-y-3">
            <div className="flex justify-between items-end px-2">
               <h3 className="font-bold text-slate-700">Klaim Menunggu ({pendingClaims.length})</h3>
               {isGeneral && <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-md font-bold">Mode General</span>}
            </div>

            {pendingClaims.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                <CheckCircle size={48} className="mx-auto mb-3 opacity-20 text-green-500" />
                <p>Tidak ada klaim pending.</p>
                {!isGeneral && <p className="text-xs mt-1">untuk wilayah {location}</p>}
              </div>
            ) : (
              pendingClaims.map(claim => (
                <div key={claim.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3 relative overflow-hidden">
                  {/* Location Tag for General Admin */}
                  {isGeneral && (
                    <div className="absolute top-0 right-0 bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                      {claim.location}
                    </div>
                  )}

                  <div className="flex justify-between items-start mt-1">
                    <div>
                      <div className="font-bold text-slate-800 text-lg">{claim.userName}</div>
                      <div className="text-indigo-600 font-medium text-sm flex items-center gap-1">
                        <Coffee size={14}/> {claim.drinkName}
                      </div>
                      {!isGeneral && (
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <MapPin size={10}/> {claim.location}
                        </div>
                      )}
                    </div>
                    <div className="text-right pt-4">
                       <div className="text-xs text-slate-400 font-mono">{claim.timestamp ? new Date(claim.timestamp.seconds * 1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <button onClick={() => processClaim(claim, true)} className="bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors">
                      <CheckCircle size={16}/> Terima
                    </button>
                    <button onClick={() => processClaim(claim, false)} className="bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors">
                      <XCircle size={16}/> Tolak
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2 text-slate-700">
                <Plus size={16} className="text-indigo-500"/> Tambah Master Stok
              </h3>
              <form onSubmit={handleAddInventory} className="flex gap-2">
                <input required placeholder="Nama Minuman" className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={newItemName} onChange={e=>setNewItemName(e.target.value)} />
                <input required type="number" placeholder="Stok" className="w-20 bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center" value={newItemStock} onChange={e=>setNewItemStock(e.target.value)} />
                <button className="bg-indigo-600 text-white p-3 rounded-xl shadow-md hover:bg-indigo-700 transition-transform active:scale-95"><Plus size={20}/></button>
              </form>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-700 px-2 text-sm">Daftar Minuman Gudang</h3>
              {inventory.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center group hover:border-indigo-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                      <Package size={20} />
                    </div>
                    <span className="font-bold text-slate-700">{item.name}</span>
                  </div>
                  <div className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-lg font-mono font-bold text-sm">
                    {item.warehouseStock}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MobileWrapper>
  );
};

// 5. Employee Dashboard (Standard)
const EmployeeDashboard = ({ user, location, logout }) => {
  const [activeTab, setActiveTab] = useState('menu'); 
  const [todaysMenu, setTodaysMenu] = useState([]);
  const [hasClaimedToday, setHasClaimedToday] = useState(false);
  const [filterCategory, setFilterCategory] = useState('Semua');
  
  // NEW STATES FOR COUPON MODAL
  const [showCoupon, setShowCoupon] = useState(false);
  const [lastClaimData, setLastClaimData] = useState(null);

  const today = getTodayString();

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'daily_schedule'), where('date', '==', today));
    return onSnapshot(q, (snap) => setTodaysMenu(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [user, today]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'claims'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );
    return onSnapshot(q, (snap) => {
      const claims = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      const todayClaim = claims.find(c => c.date === today && c.status !== 'rejected');
      setHasClaimedToday(!!todayClaim);
    });
  }, [user, today]);

  const handleOrder = async (item) => {
    if (hasClaimedToday) return;
    if (confirm(`Klaim ${item.name} di ${location}?`)) {
      try {
        await runTransaction(db, async (transaction) => {
           // 1. Ambil data schedule terbaru untuk cek stok
           const scheduleRef = doc(db, 'artifacts', appId, 'public', 'data', 'daily_schedule', item.id);
           const scheduleDoc = await transaction.get(scheduleRef);
           
           if (!scheduleDoc.exists()) {
             throw "Item tidak ditemukan!";
           }
           
           const scheduleData = scheduleDoc.data();
           if (scheduleData.claimedCount >= scheduleData.dailyLimit) {
             throw "Stok habis!";
           }

           // 2. Kurangi Stok (Increment claimedCount)
           transaction.update(scheduleRef, { claimedCount: scheduleData.claimedCount + 1 });

           // 3. Buat Data Klaim
           const newClaimRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'claims'));
           const claimData = {
              userId: user.uid,
              userName: user.email?.split('@')[0] || 'Karyawan',
              inventoryId: item.inventoryId,
              drinkName: item.name,
              date: today,
              status: 'pending',
              location: location, 
              timestamp: serverTimestamp()
           };
           transaction.set(newClaimRef, claimData);
        });

        // Update state untuk modal (gunakan timestamp lokal untuk display instan)
        const claimDataForModal = {
          userId: user.uid,
          userName: user.email?.split('@')[0] || 'Karyawan',
          inventoryId: item.inventoryId,
          drinkName: item.name,
          date: today,
          status: 'pending',
          location: location, 
          timestamp: new Date()
        };
        
        setLastClaimData(claimDataForModal);
        setShowCoupon(true);

      } catch (e) { 
        console.error(e);
        alert(e === "Stok habis!" ? "Yah, stok baru saja habis!" : "Gagal klaim.");
      }
    }
  };

  const closeCouponAndGoHistory = () => {
    setShowCoupon(false);
    setActiveTab('history');
  };

  return (
    <MobileWrapper className="bg-gray-50">
      
      {/* Show Coupon Modal if Active */}
      {showCoupon && <CouponModal data={lastClaimData} onClose={closeCouponAndGoHistory} />}

      <div className="sticky top-0 bg-white z-20 px-6 pt-8 pb-4 shadow-sm rounded-b-[2rem]">
        <div className="flex justify-between items-center mb-2">
           <div>
             <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
               <MapPin size={12} className="text-blue-600" />
               Lokasi Pengambilan
             </div>
             <div className="font-bold text-gray-800 text-lg">
               {location}
             </div>
           </div>
           <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold border-2 border-blue-200 shadow-sm">
             {user.email?.[0].toUpperCase()}
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 no-scrollbar p-6 pt-4">
        {activeTab === 'menu' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className={`rounded-3xl p-5 text-white shadow-xl relative overflow-hidden transition-all
              ${hasClaimedToday ? 'bg-black shadow-gray-900' : 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-200'}`}>
               <div className="relative z-10 flex justify-between items-center">
                 <div>
                   <p className="text-white/80 text-xs font-medium mb-1">Status Harian</p>
                   <h2 className="text-2xl font-bold flex items-center gap-2">
                     {hasClaimedToday ? 'Sudah Klaim' : '1 Klaim Tersedia'}
                     {hasClaimedToday && <CheckCircle size={20} />}
                   </h2>
                   <p className="text-xs text-white/60 mt-1">{today}</p>
                 </div>
                 <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                   <ClipboardList className="text-white" size={24} />
                 </div>
               </div>
               <div className="absolute -right-6 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 mb-4 text-sm flex items-center gap-2">
                <Coffee size={16} className="text-blue-600"/> Menu Hari Ini
              </h3>
              
              <div className="flex gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar">
                {['Semua', 'Kopi', 'Teh', 'Air', 'Jus'].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border
                      ${filterCategory === cat 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-500 border-gray-200'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                 {todaysMenu
                   .filter(i => filterCategory === 'Semua' || i.name.toLowerCase().includes(filterCategory.toLowerCase()))
                   .map(item => {
                     const isAvailable = !hasClaimedToday && item.claimedCount < item.dailyLimit;
                     const remainingStock = item.dailyLimit - item.claimedCount;
                     
                     return (
                       <div key={item.id} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-4 transition-all hover:shadow-md">
                          <div className={`w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0 
                            ${item.name.toLowerCase().includes('kopi') ? 'bg-orange-50 text-orange-400' : 'bg-blue-50 text-blue-400'}`}>
                            {item.name.toLowerCase().includes('kopi') ? <Coffee size={28}/> : 
                             item.name.toLowerCase().includes('teh') ? <CupSoda size={28}/> :
                             item.name.toLowerCase().includes('air') ? <Droplet size={28}/> : <Package size={28}/>}
                          </div>
                          <div className="flex-1 flex flex-col justify-between py-1">
                             <div>
                               <h4 className="font-bold text-gray-800 line-clamp-1 text-lg">{item.name}</h4>
                               <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${remainingStock === 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                    Sisa Stok: {remainingStock}
                                  </span>
                               </div>
                             </div>
                             <button 
                               disabled={!isAvailable}
                               onClick={() => handleOrder(item)}
                               className={`w-full py-2 rounded-lg text-xs font-bold transition-colors mt-2
                                 ${!isAvailable 
                                   ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                   : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'}`}
                             >
                               {hasClaimedToday ? 'Besok Lagi' : remainingStock === 0 ? 'Habis' : 'Klaim Sekarang'}
                             </button>
                          </div>
                       </div>
                     );
                 })}
                 {todaysMenu.length === 0 && (
                   <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
                     <p className="text-gray-400 text-sm">Belum ada menu tersedia.</p>
                   </div>
                 )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
           <div className="animate-in fade-in duration-300">
             <HistorySection user={user} />
           </div>
        )}
      </div>

      <div className="absolute bottom-0 w-full bg-white border-t border-gray-100 px-8 py-3 pb-6 flex justify-around items-center z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-3xl">
         <NavButton icon={Home} label="Menu Klaim" active={activeTab === 'menu'} onClick={() => setActiveTab('menu')} />
         <div className="w-px h-8 bg-gray-100"></div>
         <NavButton icon={Clock} label="Riwayat" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
         <div className="w-px h-8 bg-gray-100"></div>
         <NavButton icon={LogOut} label="Keluar" active={false} onClick={logout} />
      </div>
    </MobileWrapper>
  );
};

// Sub-components
const NavButton = ({ icon: Icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all w-20 ${active ? 'text-blue-600 scale-105' : 'text-gray-400'}`}>
    <Icon size={24} strokeWidth={active ? 2.5 : 2} className={active ? "text-blue-600" : "text-gray-400"} />
    <span className={`text-[10px] font-bold ${active ? 'text-blue-600' : 'text-gray-400'}`}>{label}</span>
  </button>
);

const HistorySection = ({ user }) => {
  const [claims, setClaims] = useState([]);
  useEffect(() => {
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'claims'), where('userId', '==', user.uid), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (s) => setClaims(s.docs.map(d => ({id:d.id, ...d.data()}))));
  }, [user]);

  return (
    <div>
      <h2 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2">
        <Clock size={18} className="text-blue-600"/> Riwayat Pesanan
      </h2>
      <div className="space-y-3">
        {claims.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Belum ada riwayat.</div>
        ) : claims.map(c => (
          <div key={c.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <div className="font-bold text-gray-800">{c.drinkName}</div>
              <div className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                <Calendar size={12}/> {c.date}
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <MapPin size={12}/> {c.location || 'N/A'}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                c.status === 'approved' ? 'bg-green-100 text-green-700' :
                c.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
              }`}>{c.status}</span>
              <span className="text-[10px] text-gray-400">
                {c.timestamp?.toDate().toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'})}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main App ---
const App = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(localStorage.getItem('siapMinum_role')); // admin_general, admin_area, employee
  const [location, setLocation] = useState(localStorage.getItem('siapMinum_location'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token);
      else await signInAnonymously(auth);
    };
    init();
    return onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); });
  }, []);

  const login = (r, loc) => { 
    setRole(r); 
    setLocation(loc);
    localStorage.setItem('siapMinum_role', r); 
    localStorage.setItem('siapMinum_location', loc);
  };

  const logout = () => { 
    setRole(null); 
    setLocation(null);
    localStorage.removeItem('siapMinum_role'); 
    localStorage.removeItem('siapMinum_location');
  };

  if (loading) return <div className="h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
  if (!role) return <LoginScreen onLogin={login} />;
  
  // Dashboard routing logic
  if (role === 'admin_general' || role === 'admin_area') {
     return <AdminDashboard user={user} role={role} location={location} logout={logout} />;
  }
  
  return <EmployeeDashboard user={user} location={location} logout={logout} />;
};

export default App;
