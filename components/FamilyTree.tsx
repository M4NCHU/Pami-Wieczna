
import React, { useState, useRef, useEffect, MouseEvent as ReactMouseEvent } from 'react';
import { FamilyMember, MemorialProfile } from '../types';
import { Plus, Minus, Move, X, Upload, Trash2, Edit2, Save, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface FamilyTreeProps {
  profile: MemorialProfile;
}

interface NodePosition {
  id: string;
  x: number;
  y: number;
  data: FamilyMember | 'MAIN_PROFILE';
}

const LEVEL_HEIGHT = 180;
const NODE_WIDTH = 200;
const NODE_HEIGHT = 100;
const GAP_X = 40;

const FamilyTree: React.FC<FamilyTreeProps> = ({ profile }) => {
  const { updateProfile, user } = useAuth();
  
  // Transform State (Pan/Zoom)
  const [scale, setScale] = useState(0.8);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Edit/Add Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null); // Null means adding new
  const [formData, setFormData] = useState<Partial<FamilyMember>>({
    name: '',
    relation: 'child',
    birthDate: '',
    deathDate: '',
    photoUrl: ''
  });

  // Calculate Layout
  const calculateLayout = (): NodePosition[] => {
    const nodes: NodePosition[] = [];
    const width = containerRef.current?.clientWidth || 1000;
    const centerX = width / 2; // Center relatively, transform handles the rest
    const centerY = 300; // Start bit down

    // 0. Main Profile
    nodes.push({
      id: 'main',
      x: 0,
      y: 0,
      data: 'MAIN_PROFILE'
    });

    // Helper to distribute nodes in a row
    const distributeRow = (members: FamilyMember[], levelY: number) => {
      const totalWidth = members.length * NODE_WIDTH + (members.length - 1) * GAP_X;
      let startX = -(totalWidth / 2) + (NODE_WIDTH / 2);
      
      members.forEach((member) => {
        nodes.push({
          id: member.id,
          x: startX,
          y: levelY,
          data: member
        });
        startX += NODE_WIDTH + GAP_X;
      });
    };

    const tree = profile.familyTree || [];

    // -2: Grandparents
    distributeRow(tree.filter(m => m.relation === 'grandparent'), -LEVEL_HEIGHT * 2);
    // -1: Parents
    distributeRow(tree.filter(m => m.relation === 'parent'), -LEVEL_HEIGHT);
    // 0: Spouses / Siblings (Aside main profile)
    const level0 = [
      ...tree.filter(m => m.relation === 'sibling'),
      ...tree.filter(m => m.relation === 'spouse')
    ];
    // Split level 0 to left and right of main
    const left0 = level0.slice(0, Math.ceil(level0.length / 2));
    const right0 = level0.slice(Math.ceil(level0.length / 2));
    
    let leftX = -NODE_WIDTH - GAP_X;
    left0.forEach(m => {
        nodes.push({ id: m.id, x: leftX, y: 0, data: m });
        leftX -= (NODE_WIDTH + GAP_X);
    });
    let rightX = NODE_WIDTH + GAP_X;
    right0.forEach(m => {
        nodes.push({ id: m.id, x: rightX, y: 0, data: m });
        rightX += (NODE_WIDTH + GAP_X);
    });

    // 1: Children
    distributeRow(tree.filter(m => m.relation === 'child'), LEVEL_HEIGHT);
    // 2: Grandchildren
    distributeRow(tree.filter(m => m.relation === 'grandchild'), LEVEL_HEIGHT * 2);

    return nodes;
  };

  const nodes = calculateLayout();

  // --- Interaction Handlers ---

  const handleWheel = (e: React.WheelEvent) => {
    // e.preventDefault(); // React synthetic events don't always support this, handled on div
    const newScale = Math.min(Math.max(0.2, scale - e.deltaY * 0.001), 2);
    setScale(newScale);
  };

  const handleMouseDown = (e: ReactMouseEvent) => {
    // Only drag if clicking background, not a node
    if ((e.target as HTMLElement).closest('.tree-node')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: ReactMouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // --- CRUD Handlers ---

  const openAddModal = () => {
    setEditingMember(null);
    setFormData({ name: '', relation: 'child', birthDate: '', deathDate: '', photoUrl: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (member: FamilyMember) => {
    setEditingMember(member);
    setFormData({ ...member });
    setIsModalOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveMember = () => {
    if (!formData.name || !formData.relation) return alert("Imię i relacja są wymagane.");

    let newTree = [...(profile.familyTree || [])];

    if (editingMember) {
      // Update
      newTree = newTree.map(m => m.id === editingMember.id ? { ...m, ...formData } as FamilyMember : m);
    } else {
      // Add
      const newMember: FamilyMember = {
        id: Date.now().toString(),
        name: formData.name!,
        relation: formData.relation as any,
        birthDate: formData.birthDate,
        deathDate: formData.deathDate,
        photoUrl: formData.photoUrl
      };
      newTree.push(newMember);
    }

    updateProfile({ ...profile, familyTree: newTree });
    setIsModalOpen(false);
  };

  const deleteMember = (id: string) => {
    if (window.confirm("Czy na pewno chcesz usunąć tę osobę z drzewa?")) {
      const newTree = (profile.familyTree || []).filter(m => m.id !== id);
      updateProfile({ ...profile, familyTree: newTree });
    }
  };

  // --- Rendering Helpers ---

  const renderConnections = () => {
    const mainNode = nodes.find(n => n.id === 'main');
    if (!mainNode) return null;

    return nodes.map(node => {
      if (node.id === 'main') return null;

      let start = { x: 0, y: 0 };
      let end = { x: 0, y: 0 };
      
      const member = node.data as FamilyMember;
      
      // Simple logic: Connect generation N to N+1 center or Main
      // Ideally we connect parents to grandparents, main to parents/children/spouses, children to grandchildren
      
      // Target is always the node we are iterating
      end = { x: node.x, y: node.y - (NODE_HEIGHT/2) + 5 }; // Top of node
      
      // Source determination
      if (member.relation === 'grandparent') {
          // Connect to "Parents" layer center (approx) or specific parent logic is complex without ID links
          // Visually: Connect to Parents Layer
          start = { x: 0, y: -LEVEL_HEIGHT + (NODE_HEIGHT/2) }; // Bottom of Parent Layer center
          end = { x: node.x, y: node.y + (NODE_HEIGHT/2) }; // Bottom of GP (inverted for top layers)
      } else if (member.relation === 'parent') {
          // Connect to Main
          start = { x: mainNode.x, y: mainNode.y - (NODE_HEIGHT/2) };
          end = { x: node.x, y: node.y + (NODE_HEIGHT/2) };
      } else if (member.relation === 'child') {
          // Connect to Main
          start = { x: mainNode.x, y: mainNode.y + (NODE_HEIGHT/2) };
          end = { x: node.x, y: node.y - (NODE_HEIGHT/2) };
      } else if (member.relation === 'grandchild') {
          // Connect to Child Layer center
          // Heuristic: Connect to a point in Child layer
           start = { x: node.x / 2, y: LEVEL_HEIGHT + (NODE_HEIGHT/2) }; // Rough approximation
           end = { x: node.x, y: node.y - (NODE_HEIGHT/2) };
      } else {
         // Spouses / Siblings - horizontal line
         start = { x: mainNode.x + (node.x > 0 ? NODE_WIDTH/2 : -NODE_WIDTH/2), y: mainNode.y };
         end = { x: node.x + (node.x > 0 ? -NODE_WIDTH/2 : NODE_WIDTH/2), y: node.y };
      }

      // Bezier Curve
      const controlY = (start.y + end.y) / 2;
      const path = `M ${start.x} ${start.y} C ${start.x} ${controlY}, ${end.x} ${controlY}, ${end.x} ${end.y}`;

      return (
        <path
          key={`path-${node.id}`}
          d={path}
          stroke="#d6d3d1" // stone-300
          strokeWidth="2"
          fill="none"
        />
      );
    });
  };

  const isOwner = user?.id === profile.userId || user?.role === 'admin';

  return (
    <div className="bg-stone-200 rounded-lg overflow-hidden border border-stone-300 shadow-inner relative h-[700px]">
      
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-white p-2 rounded-md shadow-md">
         <button onClick={() => setScale(s => s + 0.1)} className="p-1 hover:bg-stone-100 rounded"><Plus className="h-5 w-5" /></button>
         <button onClick={() => setScale(s => Math.max(0.2, s - 0.1))} className="p-1 hover:bg-stone-100 rounded"><Minus className="h-5 w-5" /></button>
         <div className="h-px bg-stone-200 my-1"></div>
         <div className="p-1 text-stone-400 cursor-grab" title="Przesuwaj myszką"><Move className="h-5 w-5" /></div>
      </div>
      
      {isOwner && (
        <button 
            onClick={openAddModal}
            className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-emerald-700 transition"
        >
            <Plus className="h-4 w-4" /> Dodaj Osobę
        </button>
      )}

      {/* Canvas */}
      <div 
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div 
            style={{ 
                transform: `translate(${position.x + (containerRef.current?.clientWidth || 800)/2}px, ${position.y + 350}px) scale(${scale})`,
                transformOrigin: '0 0',
                transition: isDragging ? 'none' : 'transform 0.1s ease-out'
            }}
            className="absolute top-0 left-0 w-0 h-0"
        >
           {/* Lines Layer */}
           <svg className="overflow-visible absolute top-0 left-0" style={{ pointerEvents: 'none', zIndex: 0 }}>
              {renderConnections()}
           </svg>

           {/* Nodes Layer */}
           {nodes.map(node => {
               const isMain = node.data === 'MAIN_PROFILE';
               const member = isMain ? null : node.data as FamilyMember;
               
               return (
                   <div
                      key={node.id}
                      className="tree-node absolute flex flex-col items-center justify-center p-3 bg-white rounded-lg shadow-md border border-stone-200 transition-shadow hover:shadow-xl hover:z-20 group"
                      style={{
                          width: NODE_WIDTH,
                          height: NODE_HEIGHT,
                          left: node.x - NODE_WIDTH/2,
                          top: node.y - NODE_HEIGHT/2,
                      }}
                   >
                        {isMain ? (
                             <>
                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gold-500 mb-2">
                                    <img src={profile.mainPhotoUrl} className="w-full h-full object-cover" alt="Main" />
                                </div>
                                <div className="text-center">
                                    <p className="font-serif font-bold text-stone-900 leading-tight">{profile.firstName} {profile.lastName}</p>
                                    <span className="text-[10px] uppercase tracking-wider text-gold-600 font-bold">Osoba Zmarła</span>
                                </div>
                             </>
                        ) : (
                            <>
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    {isOwner && (
                                        <>
                                            <button onClick={() => openEditModal(member!)} className="p-1 bg-stone-100 rounded hover:bg-stone-200 text-stone-600"><Edit2 className="h-3 w-3" /></button>
                                            <button onClick={() => deleteMember(member!.id)} className="p-1 bg-red-100 rounded hover:bg-red-200 text-red-600"><Trash2 className="h-3 w-3" /></button>
                                        </>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 w-full">
                                    <div className="w-10 h-10 rounded-full bg-stone-100 overflow-hidden flex-shrink-0 border border-stone-200">
                                        {member!.photoUrl ? (
                                            <img src={member!.photoUrl} className="w-full h-full object-cover" alt={member!.name} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-stone-400"><UserIcon className="h-5 w-5" /></div>
                                        )}
                                    </div>
                                    <div className="text-left overflow-hidden">
                                        <p className="font-medium text-stone-800 text-sm truncate" title={member!.name}>{member!.name}</p>
                                        <p className="text-xs text-stone-500 mb-0.5">{translateRelation(member!.relation)}</p>
                                        <p className="text-[10px] text-stone-400 bg-stone-50 inline-block px-1 rounded">
                                            {member!.birthDate || '?'} - {member!.deathDate ? member!.deathDate : (member!.birthDate ? 'Obecnie' : '?')}
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}
                   </div>
               );
           })}
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
          <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 animate-fade-in-up">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-serif font-bold text-stone-900">
                          {editingMember ? 'Edytuj Osobę' : 'Dodaj Członka Rodziny'}
                      </h3>
                      <button onClick={() => setIsModalOpen(false)}><X className="h-5 w-5 text-stone-400" /></button>
                  </div>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-stone-700">Imię i Nazwisko</label>
                          <input 
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full border border-stone-300 rounded-md p-2 mt-1"
                            placeholder="Jan Kowalski"
                          />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-stone-700">Relacja (względem zmarłego)</label>
                            <select 
                                value={formData.relation}
                                onChange={e => setFormData({...formData, relation: e.target.value as any})}
                                className="w-full border border-stone-300 rounded-md p-2 mt-1"
                            >
                                <option value="grandparent">Dziadek/Babcia</option>
                                <option value="parent">Rodzic</option>
                                <option value="spouse">Małżonek</option>
                                <option value="sibling">Rodzeństwo</option>
                                <option value="child">Dziecko</option>
                                <option value="grandchild">Wnuk</option>
                            </select>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-stone-700">Zdjęcie</label>
                              <div className="mt-1 flex items-center">
                                  <label className="cursor-pointer bg-stone-100 hover:bg-stone-200 text-stone-600 px-3 py-2 rounded-md text-sm flex items-center gap-2 w-full justify-center border border-stone-300 border-dashed">
                                      <Upload className="h-4 w-4" /> Wyślij
                                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                  </label>
                              </div>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-stone-700">Rok urodzenia</label>
                            <input 
                                type="text"
                                value={formData.birthDate}
                                onChange={e => setFormData({...formData, birthDate: e.target.value})}
                                className="w-full border border-stone-300 rounded-md p-2 mt-1"
                                placeholder="1980"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-stone-700">Rok śmierci (opcjonalnie)</label>
                            <input 
                                type="text"
                                value={formData.deathDate}
                                onChange={e => setFormData({...formData, deathDate: e.target.value})}
                                className="w-full border border-stone-300 rounded-md p-2 mt-1"
                                placeholder="pozostaw puste jeśli żyje"
                            />
                          </div>
                      </div>

                      {formData.photoUrl && (
                          <div className="flex justify-center mt-2">
                              <img src={formData.photoUrl} alt="Preview" className="h-20 w-20 object-cover rounded-full border-2 border-stone-200" />
                          </div>
                      )}

                      <button 
                        onClick={saveMember}
                        className="w-full bg-stone-800 text-white py-2 rounded-md font-medium hover:bg-stone-900 mt-4 flex items-center justify-center gap-2"
                      >
                          <Save className="h-4 w-4" /> Zapisz
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

const translateRelation = (relation: string) => {
    switch(relation) {
        case 'grandparent': return 'Dziadek / Babcia';
        case 'parent': return 'Rodzic';
        case 'spouse': return 'Małżonek/ka';
        case 'sibling': return 'Rodzeństwo';
        case 'child': return 'Dziecko';
        case 'grandchild': return 'Wnuk / Wnuczka';
        default: return relation;
    }
};

export default FamilyTree;
