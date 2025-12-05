
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, Navigate } from 'react-router-dom';
import { Plus, Users, QrCode, User as UserIcon } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, users, profiles } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Filter profiles based on role
  const myProfiles = profiles.filter(p => user.role === 'admin' || p.userId === user.id);

  return (
    <div className="bg-stone-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* User Account Section */}
        <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
             <div className="bg-emerald-100 p-3 rounded-full">
                <UserIcon className="h-8 w-8 text-emerald-700" />
             </div>
             <div>
                <h1 className="text-2xl font-serif font-bold text-stone-900">
                  Panel Użytkownika: {user.username}
                </h1>
                <p className="text-stone-500 text-sm">
                  Zarządzaj swoim kontem i finansami
                </p>
             </div>
          </div>
          <div className="text-right">
             <p className="text-stone-600 text-sm">Dostępne środki</p>
             <p className="text-3xl font-bold text-emerald-600">{user.walletBalance.toFixed(2)} zł</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                 <QrCode className="h-5 w-5" /> Zarządzane Osoby (Profile Pamięci)
                 <span className="bg-stone-200 text-stone-600 text-xs px-2 py-1 rounded-full">{myProfiles.length}</span>
             </h2>
             <Link
                to="/create"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-stone-800 hover:bg-stone-900"
              >
                <Plus className="h-4 w-4 mr-2" />
                Dodaj Nową Osobę
              </Link>
        </div>

        {/* Profiles List */}
        <div className="mb-12">
          {myProfiles.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-lg shadow-sm border border-stone-200 border-dashed">
              <p className="text-stone-500 text-lg mb-2">Twoja lista osób jest pusta.</p>
              <p className="text-stone-400 text-sm mb-4">Dodaj profil osoby zmarłej, aby stworzyć dla niej cyfrowe miejsce pamięci.</p>
              <Link to="/create" className="text-emerald-600 hover:text-emerald-500 font-medium inline-block">
                Stwórz pierwszy profil &rarr;
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProfiles.map((profile) => (
                <div key={profile.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 overflow-hidden border border-stone-100 flex flex-col group">
                  <div className="h-48 bg-stone-200 relative overflow-hidden">
                     <img 
                        src={profile.mainPhotoUrl} 
                        alt="Main" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                     <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="text-xl font-serif font-bold">
                          {profile.firstName} {profile.lastName}
                        </h3>
                     </div>
                  </div>
                  <div className="p-5 flex-grow flex flex-col">
                    <div className="flex items-center text-xs text-stone-500 mb-3 space-x-2">
                        <span>ur. {profile.birthDate}</span>
                        <span>&bull;</span>
                        <span>zm. {profile.deathDate}</span>
                    </div>
                    <p className="text-sm text-stone-600 mb-4 line-clamp-3 leading-relaxed">
                      {profile.bio}
                    </p>
                    
                    <div className="mt-auto pt-4 border-t border-stone-100 flex justify-between items-center">
                        <div className="flex flex-col">
                             <span className="text-xs text-stone-400">Drzewo genealogiczne</span>
                             <span className="text-sm font-semibold text-stone-700">{profile.familyTree?.length || 0} osób</span>
                        </div>
                        {profile.location && (
                            <div className="flex flex-col items-end">
                                <span className="text-xs text-stone-400">Lokalizacja</span>
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> GPS
                                </span>
                            </div>
                        )}
                    </div>
                  </div>
                  <Link 
                      to={`/profile/${profile.id}`}
                      className="block bg-stone-50 py-3 text-center text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900 border-t border-stone-100 transition-colors"
                    >
                      Zarządzaj Profilem &raquo;
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Admin Section: User List */}
        {user.role === 'admin' && (
          <div className="border-t border-stone-200 pt-10">
             <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" /> Administracja Użytkownikami Systemu
             </h2>
             <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-stone-200">
                  <thead className="bg-stone-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Login Użytkownika</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Rola</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Stan Portfela</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-stone-200">
                    {users.map(u => (
                      <tr key={u.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">{u.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-900">{u.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">{u.role}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-bold">{u.walletBalance.toFixed(2)} zł</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
