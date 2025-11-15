import React, { useState } from "react";
import ProductUploadForm from "../../components/admin/ProductUploadForm";
import AdminProductList from "../../components/admin/AdminProductList";
import EditProductForm from "../../components/admin/EditProductForm";
import DeleteProductConfirm from "../../components/admin/DeleteProductConfirm";

export default function AdminDashboard() {
  const [tab, setTab] = useState("create"); // create | list | edit | delete
  const [selected, setSelected] = useState(null);

  return (
    <div className="min-h-screen bg-white py-10">
      <div className="container-app">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <p className="text-gray-700 mb-6">Manage products: create, edit, or delete items.</p>

        <div className="flex gap-2 mb-6">
          <button onClick={() => { setTab('create'); setSelected(null); }} className={`px-4 py-2 rounded ${tab==='create' ? 'bg-black text-white' : 'border'}`}>Create</button>
          <button onClick={() => { setTab('list'); setSelected(null); }} className={`px-4 py-2 rounded ${tab==='list' ? 'bg-black text-white' : 'border'}`}>List</button>
          <button onClick={() => setTab('edit')} className={`px-4 py-2 rounded ${tab==='edit' ? 'bg-black text-white' : 'border'}`}>Edit</button>
          <button onClick={() => setTab('delete')} className={`px-4 py-2 rounded ${tab==='delete' ? 'bg-black text-white' : 'border'}`}>Delete</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            {tab === 'create' && <ProductUploadForm />}
            {tab === 'list' && <AdminProductList onEdit={(p) => { setSelected(p); setTab('edit'); }} onDelete={(p) => { setSelected(p); setTab('delete'); }} />}
            {tab === 'edit' && <AdminProductList onEdit={(p) => { setSelected(p); }} onDelete={(p) => { setSelected(p); setTab('delete'); }} />}
            {tab === 'delete' && <AdminProductList onEdit={(p) => { setSelected(p); setTab('edit'); }} onDelete={(p) => { setSelected(p); }} />}
          </div>

          <div>
            {tab === 'edit' && <EditProductForm product={selected} onSaved={(updated) => { setSelected(updated); }} onCancel={() => setSelected(null)} />}
            {tab === 'delete' && <DeleteProductConfirm product={selected} onDeleted={() => { setSelected(null); }} onCancel={() => setSelected(null)} />}
          </div>
        </div>
      </div>
    </div>
  );
}
