import { Component, signal } from '@angular/core';
import { LucideAngularModule, Settings, Save, Upload } from 'lucide-angular';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
<div class="flex flex-col h-full overflow-hidden bg-[#F5F6FA]">
  <div class="bg-white border-b border-[#E0E0E0] px-8 py-5 flex-shrink-0">
    <h1 class="text-2xl font-bold text-[#111827] flex items-center gap-2">
      <lucide-icon [img]="SettingsIcon" [size]="24" class="text-[#4880FF]"></lucide-icon> Settings
    </h1>
    <p class="text-sm text-[#6B7280] mt-1">Manage your organisation preferences</p>
  </div>

  <div class="flex-1 overflow-y-auto p-8">
    <div class="max-w-2xl space-y-6">

      <!-- Organisation -->
      <div class="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-6">
        <h2 class="text-base font-bold text-[#111827] mb-5">Organisation</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-[#374151] mb-1">Organisation name</label>
            <input [value]="orgName()" (input)="orgName.set($any($event.target).value)"
              class="w-full h-[42px] px-4 bg-[#F5F6FA] border border-[#E0E0E0] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#4880FF]" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[#374151] mb-1">Contact email</label>
            <input [value]="email()" (input)="email.set($any($event.target).value)"
              class="w-full h-[42px] px-4 bg-[#F5F6FA] border border-[#E0E0E0] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#4880FF]" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[#374151] mb-1">Phone</label>
            <input [value]="phone()" (input)="phone.set($any($event.target).value)"
              class="w-full h-[42px] px-4 bg-[#F5F6FA] border border-[#E0E0E0] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#4880FF]" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[#374151] mb-1">Website</label>
            <input [value]="website()" (input)="website.set($any($event.target).value)"
              class="w-full h-[42px] px-4 bg-[#F5F6FA] border border-[#E0E0E0] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#4880FF]" />
          </div>
        </div>
      </div>

      <!-- Logo -->
      <div class="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-6">
        <h2 class="text-base font-bold text-[#111827] mb-5">Logo</h2>
        <div class="flex items-center gap-6">
          <div class="w-16 h-16 rounded-xl bg-[#EBEBFF] flex items-center justify-center">
            <span class="text-2xl font-black text-[#4880FF]">R</span>
          </div>
          <button class="flex items-center gap-2 px-4 py-2 border border-[#E0E0E0] rounded-lg text-sm font-medium text-[#374151] hover:bg-[#F5F6FA] transition-colors">
            <lucide-icon [img]="UploadIcon" [size]="16" class="text-[#6B7280]"></lucide-icon>
            Upload logo
          </button>
        </div>
      </div>

      <!-- Security -->
      <div class="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] p-6">
        <h2 class="text-base font-bold text-[#111827] mb-5">Security</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-[#374151] mb-1">Current password</label>
            <input type="password" placeholder="••••••••"
              class="w-full h-[42px] px-4 bg-[#F5F6FA] border border-[#E0E0E0] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#4880FF]" />
          </div>
          <div>
            <label class="block text-sm font-medium text-[#374151] mb-1">New password</label>
            <input type="password" placeholder="••••••••"
              class="w-full h-[42px] px-4 bg-[#F5F6FA] border border-[#E0E0E0] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#4880FF]" />
          </div>
        </div>
      </div>

      <div class="flex justify-end">
        <button class="flex items-center gap-2 px-6 py-2.5 bg-[#4880FF] hover:bg-[#3d6de0] text-white text-sm font-bold rounded-lg transition-colors">
          <lucide-icon [img]="SaveIcon" [size]="16"></lucide-icon>
          Save changes
        </button>
      </div>

    </div>
  </div>
</div>
  `,
})
export class SettingsComponent {
  readonly SettingsIcon = Settings;
  readonly SaveIcon = Save;
  readonly UploadIcon = Upload;

  orgName = signal('Riada');
  email   = signal('contact@riada.be');
  phone   = signal('+32 2 000 00 00');
  website = signal('https://riada.be');
}

