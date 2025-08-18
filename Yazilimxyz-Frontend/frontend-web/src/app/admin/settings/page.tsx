"use client";

import React, { useState, useEffect } from "react";

// Bu bileşen, hem kullanıcı hem de yönetici ayarlarını tek bir sayfada yönetir.
// This component manages both user and admin settings on a single page.

// TypeScript type definitions
interface UserProfile {
  username: string;
  email: string;
  isEmailVerified: boolean;
  theme: "light" | "dark";
  isAdmin?: boolean;
}

interface AppUser {
  id: string;
  username: string;
  email: string;
  role: "admin" | "moderator" | "user";
  isActive: boolean;
}

interface SystemLog {
  id: string;
  timestamp: string;
  message: string;
  level: "info" | "warning" | "error";
}

export default function SettingsPage() {
  // State for managing user profile, loading status, and messages.
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Simulating data fetching on component mount
  useEffect(() => {
    const fetchAllData = () => {
      // Simulate an API call with a short delay
      setTimeout(() => {
        try {
          // Mock data for the current user, assuming they are an admin.
          const fetchedProfile: UserProfile = {
            username: "adminUser",
            email: "admin@example.com",
            isEmailVerified: true,
            theme: "dark",
            isAdmin: true, // This flag determines if the admin panel is shown
          };
          setUserProfile(fetchedProfile);

          // If the user is an admin, fetch mock data for all users and system logs.
          if (fetchedProfile.isAdmin) {
            const mockUsers: AppUser[] = [
              { id: "1", username: "kullanici123", email: "user1@example.com", role: "user", isActive: true },
              { id: "2", username: "moderatorJane", email: "jane@example.com", role: "moderator", isActive: true },
              { id: "3", username: "inactiveUser", email: "inactive@example.com", role: "user", isActive: false },
              { id: "4", username: "superAdmin", email: "admin@example.com", role: "admin", isActive: true },
            ];
            setAllUsers(mockUsers);

            const mockLogs: SystemLog[] = [
              { id: "log1", timestamp: "2024-08-18 10:00", message: "Yeni kullanıcı kaydı: Alice", level: "info" },
              { id: "log2", timestamp: "2024-08-18 10:05", message: "Bakım modu etkinleştirildi", level: "warning" },
              { id: "log3", timestamp: "2024-08-18 10:10", message: "API bağlantı hatası", level: "error" },
            ];
            setSystemLogs(mockLogs);
          }
          setIsLoading(false);
        } catch (err) {
          console.error("Failed to fetch data:", err);
          setMessage({ type: 'error', text: "Veriler yüklenirken bir hata oluştu." });
          setIsLoading(false);
        }
      }, 1000);
    };

    fetchAllData();
  }, []);

  // Handle form submission for both user and admin settings
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Simulate saving data to an API
    setTimeout(() => {
      try {
        console.log("Updated profile:", userProfile);
        console.log("Updated user list:", allUsers);
        setMessage({ type: 'success', text: "Ayarlarınız başarıyla güncellendi!" });
      } catch (err) {
        setMessage({ type: 'error', text: "Ayarlar kaydedilirken bir hata oluştu." });
      } finally {
        setIsLoading(false);
      }
    }, 1500);
  };

  // Handle input changes for the current user's profile
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserProfile(prevProfile => {
        if (!prevProfile) return null;
        return {
            ...prevProfile,
            [name]: value
        };
    });
  };

  // Handle role change for a specific user (admin action)
  const handleRoleChange = (userId: string, newRole: "admin" | "moderator" | "user") => {
    setAllUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );
  };

  // Handle account suspension/activation (admin action)
  const handleAccountToggle = (userId: string) => {
    setAllUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId ? { ...user, isActive: !user.isActive } : user
      )
    );
  };

  // Loading state handling
  if (isLoading && !userProfile) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-gray-500 text-lg">Ayarlar yükleniyor...</p>
      </div>
    );
  }

  // Error state handling
  if (!userProfile) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-red-500 text-lg">Kullanıcı verisi bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full bg-white p-8 md:p-12 rounded-2xl shadow-xl">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Hesap Ayarları</h1>
          <p className="mt-2 text-md text-gray-500">Profil bilgilerinizi ve tercihlerinizi düzenleyin.</p>
        </div>
        
        {/* Message feedback section */}
        {message && (
          <div className={`flex items-center p-4 rounded-lg mb-6 transition-all duration-300 ${message.type === 'success' ? 'bg-green-50 text-green-700 ring-1 ring-green-200' : 'bg-red-50 text-red-700 ring-1 ring-red-200'}`}>
            <div className="mr-3">
              {message.type === 'success' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              )}
            </div>
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* User Profile Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Hesap Bilgileri</h2>
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Adı</label>
              <input
                type="text"
                id="username"
                name="username"
                value={userProfile.username}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-10 px-4"
                placeholder="Yeni Kullanıcı Adı"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-posta Adresi</label>
              <input
                type="email"
                id="email"
                name="email"
                value={userProfile.email}
                className="block w-full rounded-md bg-gray-100 text-gray-500 border-gray-300 shadow-sm sm:text-sm h-10 px-4 cursor-not-allowed"
                readOnly
              />
              {userProfile.isEmailVerified && (
                <p className="mt-2 text-xs text-green-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <span>Onaylı</span>
                </p>
              )}
            </div>
          </div>

          <hr className="my-6 border-gray-200" />
          
          {/* Preferences Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Uygulama Tercihleri</h2>
            
            <div>
              <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">Tema</label>
              <select
                id="theme"
                name="theme"
                value={userProfile.theme}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-10 px-4 pr-10"
              >
                <option value="light">Aydınlık</option>
                <option value="dark">Karanlık</option>
              </select>
            </div>
          </div>

          {/* Admin Panel Section - visible only to admins */}
          {userProfile.isAdmin && (
            <>
              <hr className="my-6 border-gray-200" />
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Yönetici Paneli</h2>
                
                {/* User Management */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Kullanıcı Yönetimi</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kullanıcı Adı</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {allUsers.map(user => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <select
                                value={user.role}
                                onChange={(e) => handleRoleChange(user.id, e.target.value as "admin" | "moderator" | "user")}
                                className="rounded-md border-gray-300 shadow-sm sm:text-sm"
                              >
                                <option value="user">Kullanıcı</option>
                                <option value="moderator">Moderatör</option>
                                <option value="admin">Yönetici</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {user.isActive ? "Aktif" : "Devre Dışı"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                type="button"
                                onClick={() => handleAccountToggle(user.id)}
                                className={`text-indigo-600 hover:text-indigo-900 transition-colors duration-150 ${user.isActive ? 'text-red-600' : 'text-green-600'}`}
                              >
                                {user.isActive ? "Devre Dışı Bırak" : "Aktif Et"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* System Controls */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Sistem Kontrolleri</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Bakım Modu</span>
                      <label htmlFor="maintenance-toggle" className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="maintenance-toggle" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Yeni Kullanıcı Kayıtlarını Kapat</span>
                      <label htmlFor="registration-toggle" className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="registration-toggle" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* System Logs */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Sistem Logları</h3>
                  <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                    {systemLogs.map(log => (
                      <div key={log.id} className={`p-3 rounded-lg flex items-start space-x-2 ${log.level === 'error' ? 'bg-red-100' : log.level === 'warning' ? 'bg-yellow-100' : 'bg-gray-200'}`}>
                        {log.level === 'error' ? (
                          <span className="text-red-600 font-bold">HATA:</span>
                        ) : log.level === 'warning' ? (
                          <span className="text-yellow-600 font-bold">UYARI:</span>
                        ) : (
                          <span className="text-gray-600 font-bold">BİLGİ:</span>
                        )}
                        <span className="text-gray-700 flex-1">{log.timestamp} - {log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Save button */}
          <div className="pt-6">
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform duration-150 transform hover:scale-105"
              disabled={isLoading}
            >
              {isLoading ? "Kaydediliyor..." : "Ayarları Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}