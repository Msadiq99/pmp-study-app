"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { groups } from "@/lib/api";
import Link from "next/link";

export default function GroupsPage() {
  const router = useRouter();
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [joinCode, setJoinCode] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.push("/login"); return; }
    groups.my().then(r => setMyGroups(r.data));
  }, []);

  const createGroup = async () => {
    if (!name) return;
    const res = await groups.create(name, desc);
    setMyGroups([...myGroups, { id: res.data.id, name: name, invite_code: res.data.invite_code }]);
    setName(""); setDesc(""); setShowCreate(false);
  };

  const joinGroup = async () => {
    if (!joinCode) return;
    try {
      await groups.join(joinCode);
      groups.my().then(r => setMyGroups(r.data));
      setJoinCode(""); setShowJoin(false);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to join group");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold text-blue-600">PMP Study App</Link>
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-blue-600">Dashboard</Link>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Study Groups</h1>
          <div className="flex gap-3">
            <button onClick={() => { setShowCreate(!showCreate); setShowJoin(false); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg">+ Create Group</button>
            <button onClick={() => { setShowJoin(!showJoin); setShowCreate(false); }} className="px-4 py-2 bg-green-600 text-white rounded-lg">Join Group</button>
          </div>
        </div>

        {showCreate && (
          <div className="bg-white p-6 rounded-xl border mb-6">
            <h3 className="font-semibold mb-4">Create Study Group</h3>
            <input placeholder="Group name" className="w-full px-4 py-2 border rounded-lg mb-3" value={name} onChange={e => setName(e.target.value)} />
            <textarea placeholder="Description (optional)" className="w-full px-4 py-2 border rounded-lg mb-3" rows={2} value={desc} onChange={e => setDesc(e.target.value)} />
            <button onClick={createGroup} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Create</button>
          </div>
        )}

        {showJoin && (
          <div className="bg-white p-6 rounded-xl border mb-6">
            <h3 className="font-semibold mb-4">Join Study Group</h3>
            <input placeholder="Enter invite code" className="w-full px-4 py-2 border rounded-lg mb-3 uppercase tracking-widest font-mono" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} />
            <button onClick={joinGroup} className="px-4 py-2 bg-green-600 text-white rounded-lg">Join</button>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {myGroups.map(g => (
            <div key={g.id} className="bg-white p-5 rounded-xl border">
              <h3 className="font-semibold text-lg">{g.name}</h3>
              <p className="text-sm text-gray-500 mt-1">Invite Code: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{g.invite_code}</span></p>
              <p className="text-xs text-gray-400 mt-2">Share this code with study partners</p>
            </div>
          ))}
        </div>
        {myGroups.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No study groups yet</p>
            <p className="text-sm">Create or join a group to study with peers.</p>
          </div>
        )}
      </main>
    </div>
  );
}
