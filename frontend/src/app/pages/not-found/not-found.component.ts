import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
<div class="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#4880FF]">
  <svg class="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1440 900" fill="none" preserveAspectRatio="none">
    <path d="M0 0H1440V900H0V0Z" fill="#4880FF"/>
    <path opacity="0.4" d="M1440 900H0V458.75C170 338.35 430.5 407.45 613 543.1C855.5 723.1 1137.5 730 1440 523.5V900Z" fill="#3D6DE0"/>
    <path opacity="0.6" d="M0 900H1440V683.5C1185 864.5 905.5 831.3 643.5 612.3C407.5 415.7 151 380 0 541.5V900Z" fill="#588DFF"/>
    <path opacity="0.3" d="M1440 0H0V284.5C216.5 125.7 483 189 713.5 382.7C994.5 618.3 1269.5 588.7 1440 401V0Z" fill="#3D6DE0"/>
  </svg>

  <div class="w-full max-w-[560px] bg-white rounded-[24px] p-12 shadow-xl z-10 mx-4 flex flex-col items-center">
    <div class="w-full max-w-[320px] aspect-[4/3] bg-[#2185D0] rounded-t-[12px] rounded-b-[4px] relative overflow-hidden mb-10 mt-4 shadow-sm border-[4px] border-[#EAF0FF]">
      <div class="absolute top-0 left-0 w-full h-[32px] bg-[#EAF0FF] flex items-center px-4 space-x-2">
        <div class="w-3 h-3 rounded-full bg-[#FF4747]"></div>
        <div class="w-3 h-3 rounded-full bg-[#FFB800]"></div>
        <div class="w-3 h-3 rounded-full bg-[#00B69B]"></div>
        <div class="ml-4 w-8 h-3 rounded-full bg-[#D9E2FF]"></div>
      </div>
      <div class="absolute top-[32px] left-0 w-full h-[calc(100%-32px)] bg-[#1A83FE] flex items-center justify-center">
        <div class="flex items-center space-x-6">
          <div class="text-[100px] font-black text-[#FFB800] leading-none">4</div>
          <div class="text-[100px] font-black text-[#FFB800] leading-none">0</div>
          <div class="text-[100px] font-black text-[#FFB800] leading-none">4</div>
        </div>
      </div>
    </div>
    <h1 class="text-[24px] font-bold text-[#202224] text-center mb-8">Looks like you've got lost....</h1>
    <a routerLink="/" class="w-full h-[50px] bg-[#588DFF] hover:bg-[#4880FF] text-white font-medium rounded-[8px] transition-colors flex items-center justify-center">
      Back to Dashboard
    </a>
  </div>
</div>
  `,
})
export class NotFoundComponent {}
