import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  UtensilsCrossed, User, Mail, Lock, Phone, Building, ArrowRight,
  GraduationCap, Briefcase, Eye, EyeOff, CheckCircle2, Shield
} from 'lucide-react';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [collegeId, setCollegeId] = useState('clg_anurag');
  const [departmentId, setDepartmentId] = useState('dept_cse');
  const [roomNumber, setRoomNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Full name, email, and password are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/auth/register', {
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        phone: phone.trim(),
        role,
        college_id: collegeId,
        department_id: departmentId,
        room_number: roomNumber.trim()
      });

      login(res.data.user, res.data.token);
      navigate(role === 'FACULTY' ? '/faculty' : '/student');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
        
        {/* HEADER */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Create Campus Account
          </h2>
          <p className="text-xs text-slate-500">
            Join the CanteenX smart campus network for automated dining & paperless orders
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-bold rounded-2xl text-center flex items-center justify-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          
          {/* ROLE SELECTOR */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Select Campus Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`py-3 px-4 text-xs font-black rounded-2xl border transition-all flex items-center justify-center gap-2 ${
                  role === 'STUDENT'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
                }`}
              >
                <GraduationCap className="w-4 h-4" /> Student Portal
              </button>
              <button
                type="button"
                onClick={() => setRole('FACULTY')}
                className={`py-3 px-4 text-xs font-black rounded-2xl border transition-all flex items-center justify-center gap-2 ${
                  role === 'FACULTY'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-300'
                }`}
              >
                <Briefcase className="w-4 h-4" /> Faculty Portal
              </button>
            </div>
          </div>

          {/* NAME & EMAIL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Karthikeya Rishi"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">College Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@apex.edu"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>
          </div>

          {/* COLLEGE & DEPARTMENT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">College</label>
              <select
                value={collegeId}
                onChange={(e) => setCollegeId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
              >
                <option value="clg_anurag">Anurag University</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Department</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
              >
                <option value="dept_cse">Computer Science & Engineering (CSE)</option>
                <option value="dept_ece">Electronics & Communication (ECE)</option>
                <option value="dept_mech">Mechanical Engineering (MECH)</option>
                <option value="dept_civil">Civil Engineering (CIVIL)</option>
                <option value="dept_mba">School of Business (MBA)</option>
              </select>
            </div>
          </div>

          {/* PASSWORD WITH TOGGLE & PHONE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Mobile Contact</label>
              <div className="relative">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>
          </div>

          {/* DORM / CABIN / ROOM */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {role === 'FACULTY' ? 'Faculty Cabin / Room Number (e.g. Block A Cabin 204)' : 'Dorm / Hostel Room Number (Optional)'}
            </label>
            <input
              type="text"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder={role === 'FACULTY' ? 'Block A Cabin 204' : 'Hostel Block 3, Room 104'}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Creating Campus Profile...' : 'Complete Registration'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 text-center text-xs text-slate-500">
          Already registered on CanteenX?{' '}
          <Link to="/login" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            Sign In Here
          </Link>
        </div>

      </div>
    </div>
  );
}
