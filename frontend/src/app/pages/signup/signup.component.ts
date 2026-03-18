import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Check } from 'lucide-angular';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  template: `
<div class="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#4880FF] py-12">
  <svg class="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1440 900" fill="none" preserveAspectRatio="none">
    <path d="M0 0H1440V900H0V0Z" fill="#4880FF"/>
    <path opacity="0.4" d="M1440 900H0V458.75C170 338.35 430.5 407.45 613 543.1C855.5 723.1 1137.5 730 1440 523.5V900Z" fill="#3D6DE0"/>
    <path opacity="0.6" d="M0 900H1440V683.5C1185 864.5 905.5 831.3 643.5 612.3C407.5 415.7 151 380 0 541.5V900Z" fill="#588DFF"/>
    <path opacity="0.3" d="M1440 0H0V284.5C216.5 125.7 483 189 713.5 382.7C994.5 618.3 1269.5 588.7 1440 401V0Z" fill="#3D6DE0"/>
  </svg>

  <div class="w-full max-w-[560px] bg-white rounded-[24px] p-12 shadow-xl z-10 mx-4">
    <h1 class="text-[28px] font-bold text-[#202224] text-center mb-2">Create an Account</h1>
    <p class="text-[14px] text-[#606060] text-center mb-10">Create a account to continue</p>

    <form class="space-y-6">
      <div class="space-y-2">
        <label class="text-[14px] text-[#202224] font-medium">Email address:</label>
        <input type="email" placeholder="esteban_schiller@gmail.com"
          class="w-full h-[50px] px-4 bg-[#F5F6FA] border border-[#E0E0E0] rounded-[8px] text-[14px] focus:outline-none focus:ring-1 focus:ring-[#4880FF] focus:bg-white transition-colors" />
      </div>
      <div class="space-y-2">
        <label class="text-[14px] text-[#202224] font-medium">Username</label>
        <input type="text" placeholder="Username"
          class="w-full h-[50px] px-4 bg-[#F5F6FA] border border-[#E0E0E0] rounded-[8px] text-[14px] focus:outline-none focus:ring-1 focus:ring-[#4880FF] focus:bg-white transition-colors" />
      </div>
      <div class="space-y-2">
        <label class="text-[14px] text-[#202224] font-medium">Password</label>
        <input type="password" placeholder="••••••••"
          class="w-full h-[50px] px-4 bg-[#F5F6FA] border border-[#E0E0E0] rounded-[8px] text-[14px] tracking-widest focus:outline-none focus:ring-1 focus:ring-[#4880FF] focus:bg-white transition-colors" />
      </div>

      <div class="flex items-center space-x-3 pt-2">
        <div (click)="accept.set(!accept())"
          [class]="'w-5 h-5 rounded-[4px] border flex items-center justify-center cursor-pointer transition-colors ' + (accept() ? 'bg-[#4880FF] border-[#4880FF]' : 'border-[#C4C4C4] bg-white')">
          @if (accept()) { <lucide-icon [img]="CheckIcon" [size]="14" class="text-white"></lucide-icon> }
        </div>
        <span class="text-[14px] text-[#606060] cursor-pointer" (click)="accept.set(!accept())">I accept terms and conditions</span>
      </div>

      <div class="pt-6">
        <button type="button" class="w-full h-[50px] bg-[#4880FF] hover:bg-[#3d6de0] text-white font-bold rounded-[8px] transition-colors">
          Sign Up
        </button>
      </div>

      <p class="text-center text-[14px] text-[#606060] pt-4">
        Already have an account? <a routerLink="/login" class="text-[#4880FF] font-medium hover:underline">Login</a>
      </p>
    </form>
  </div>
</div>
  `,
})
export class SignupComponent {
  accept = signal(false);
  readonly CheckIcon = Check;
}

