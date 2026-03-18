import { Link } from "react-router";
import { Check } from "lucide-react";
import { useState } from "react";

const WavyBackground = () => (
  <svg className="absolute inset-0 w-full h-full object-cover pointer-events-none -z-10" viewBox="0 0 1440 900" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0H1440V900H0V0Z" fill="#4880FF" />
    <path opacity="0.4" d="M1440 900H0V458.75C170 338.35 430.5 407.45 613 543.1C855.5 723.1 1137.5 730 1440 523.5V900Z" fill="#3D6DE0" />
    <path opacity="0.6" d="M0 900H1440V683.5C1185 864.5 905.5 831.3 643.5 612.3C407.5 415.7 151 380 0 541.5V900Z" fill="#588DFF" />
    <path opacity="0.3" d="M1440 0H0V284.5C216.5 125.7 483 189 713.5 382.7C994.5 618.3 1269.5 588.7 1440 401V0Z" fill="#3D6DE0" />
  </svg>
);

export function Login() {
  const [remember, setRemember] = useState(false);

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#4880FF]">
      <WavyBackground />

      <div className="w-full max-w-[560px] bg-white rounded-[24px] p-12 shadow-xl z-10 mx-4">
        <h1 className="text-[28px] font-bold text-[#202224] text-center mb-2">Login to Account</h1>
        <p className="text-[14px] text-[#202224] text-center mb-10">Please enter your email and password to continue</p>

        <form className="space-y-6">
          <div className="space-y-2">
            <label className="text-[14px] text-[#202224] font-medium">Email address:</label>
            <input 
              type="email" 
              placeholder="esteban_schiller@gmail.com"
              className="w-full h-[50px] px-4 bg-[#F5F6FA] border border-[#E0E0E0] rounded-[8px] text-[14px] text-[#202224] focus:outline-none focus:ring-1 focus:ring-[#4880FF] focus:bg-white transition-colors"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[14px] text-[#202224] font-medium">Password</label>
              <Link to="#" className="text-[13px] text-[#606060] hover:text-[#4880FF]">Forget Password?</Link>
            </div>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full h-[50px] px-4 bg-[#F5F6FA] border border-[#E0E0E0] rounded-[8px] text-[14px] text-[#202224] tracking-widest focus:outline-none focus:ring-1 focus:ring-[#4880FF] focus:bg-white transition-colors"
            />
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <div 
              className={`w-5 h-5 rounded-[4px] border flex items-center justify-center cursor-pointer transition-colors ${remember ? 'bg-[#4880FF] border-[#4880FF]' : 'border-[#C4C4C4] bg-white'}`}
              onClick={() => setRemember(!remember)}
            >
              {remember && <Check className="w-3.5 h-3.5 text-white" />}
            </div>
            <span className="text-[14px] text-[#606060] cursor-pointer" onClick={() => setRemember(!remember)}>Remember Password</span>
          </div>

          <div className="pt-6">
            <button type="button" className="w-full h-[50px] bg-[#4880FF] hover:bg-[#3d6de0] text-white font-bold rounded-[8px] transition-colors">
              Sign In
            </button>
          </div>

          <p className="text-center text-[14px] text-[#606060] pt-4">
            Don't have an account? <Link to="/signup" className="text-[#4880FF] font-medium hover:underline">Create Account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
