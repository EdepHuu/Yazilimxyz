"use client";

import React, { useState } from 'react';

// Kullanıcılar için mock data (gerçek bir API'den çekilecektir)
const mockUsers = [
  { id: 1, name: 'Ahmet Yılmaz', email: 'ahmet@email.com', role: 'Admin', status: 'Aktif' },
  { id: 2, name: 'Ayşe Demir', email: 'ayse@email.com', role: 'Kullanıcı', status: 'Aktif' },
  { id: 3, name: 'Mehmet Kara', email: 'mehmet@email.com', role: 'Kullanıcı', status: 'Askıya Alınmış' },
  { id: 4, name: 'Zeynep Ak', email: 'zeynep@email.com', role: 'Kullanıcı', status: 'Aktif' },
  { id: 5, name: 'Ali Can', email: 'ali@email.com', role: 'Satıcı', status: 'Aktif' },
];

// Kullanıcılar sayfasının içeriğini barındıran bileşen
export default function UsersPage() {
  const [users, setUsers] = useState(mockUsers);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('Kullanıcı');
  const [newUserStatus, setNewUserStatus] = useState('Aktif');

  // Kullanıcı durumuna göre badge rengini belirleyen yardımcı fonksiyon
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Aktif':
        return 'bg-green-200 text-green-700';
      case 'Askıya Alınmış':
        return 'bg-red-200 text-red-700';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  // Yeni kullanıcı ekleme formu gönderildiğinde çalışacak fonksiyon
  const handleAddUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) {
      return;
    }

    const newUser = {
      id: users.length + 1,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      status: newUserStatus,
    };

    setUsers([...users, newUser]);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('Kullanıcı');
    setNewUserStatus('Aktif');
    setShowAddUserForm(false);
    console.log('Yeni kullanıcı eklendi:', newUser);
  };

  // Kullanıcı düzenleme işlemi için geçici fonksiyon
  const handleEditUser = (userId: number) => {
    console.log(`Kullanıcı düzenleniyor: ID - ${userId}`);
    // Burada düzenleme formunu açma veya API çağrısı yapma işlemleri eklenecek.
  };

  // Kullanıcı silme işlemi için geçici fonksiyon
  const handleDeleteUser = (userId: number) => {
    console.log(`Kullanıcı siliniyor: ID - ${userId}`);
    // Kullanıcıyı listeden kaldırmak için bir state güncellemesi
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Kullanıcı Yönetimi</h1>
        <button
          onClick={() => setShowAddUserForm(!showAddUserForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 ease-in-out shadow-md"
        >
          {showAddUserForm ? 'Vazgeç' : 'Yeni Kullanıcı Ekle'}
        </button>
      </div>

      {showAddUserForm && (
        <div className="mb-8">
          <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Yeni Kullanıcı Formu</h2>
            <form onSubmit={handleAddUser}>
              {/* Kullanıcı Adı */}
              <div className="mb-4">
                <label htmlFor="userName" className="block text-gray-700 text-sm font-bold mb-2">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  id="userName"
                  className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  required
                />
              </div>

              {/* E-posta */}
              <div className="mb-4">
                <label htmlFor="userEmail" className="block text-gray-700 text-sm font-bold mb-2">
                  E-posta
                </label>
                <input
                  type="email"
                  id="userEmail"
                  className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                />
              </div>

              {/* Rol */}
              <div className="mb-4">
                <label htmlFor="userRole" className="block text-gray-700 text-sm font-bold mb-2">
                  Rol
                </label>
                <select
                  id="userRole"
                  className="shadow border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                >
                  <option>Admin</option>
                  <option>Kullanıcı</option>
                  <option>Satıcı</option>
                </select>
              </div>

              {/* Durum */}
              <div className="mb-6">
                <label htmlFor="userStatus" className="block text-gray-700 text-sm font-bold mb-2">
                  Durum
                </label>
                <select
                  id="userStatus"
                  className="shadow border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newUserStatus}
                  onChange={(e) => setNewUserStatus(e.target.value)}
                >
                  <option>Aktif</option>
                  <option>Askıya Alınmış</option>
                </select>
              </div>

              {/* Kaydet butonu */}
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-200 ease-in-out w-full"
              >
                Kullanıcıyı Kaydet
              </button>
            </form>
          </div>
        </div>
      )}
      
      {/* Kullanıcılar tablosu */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Kullanıcı Adı</th>
              <th className="py-3 px-6 text-left">E-posta</th>
              <th className="py-3 px-6 text-left">Rol</th>
              <th className="py-3 px-6 text-left">Durum</th>
              <th className="py-3 px-6 text-left">İşlemler</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {users.map(user => (
              <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-6 text-left whitespace-nowrap">{user.name}</td>
                <td className="py-3 px-6 text-left">{user.email}</td>
                <td className="py-3 px-6 text-left">{user.role}</td>
                <td className="py-3 px-6 text-left">
                  <span className={`py-1 px-3 rounded-full text-xs font-semibold ${getStatusColor(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td className="py-3 px-6 text-left">
                  <div className="flex item-center justify-start">
                    <button
                      onClick={() => handleEditUser(user.id)}
                      className="w-8 h-8 mr-2 transform hover:text-purple-500 hover:scale-110"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="w-8 h-8 mr-2 transform hover:text-red-500 hover:scale-110"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}