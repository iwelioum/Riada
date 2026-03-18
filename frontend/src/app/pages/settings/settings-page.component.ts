import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../shared/components/ui/card.component';
import { ButtonComponent } from '../../shared/components/ui/button.component';
import { InputComponent } from '../../shared/components/ui/input.component';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent, InputComponent],
  template: `
    <div class="p-8 h-full flex flex-col max-w-4xl mx-auto w-full">
      <div class="mb-8">
        <h1 class="text-3xl font-black text-neutral-900">⚙️ Settings</h1>
        <p class="text-sm text-neutral-500 mt-2">Manage your account and system preferences</p>
      </div>

      <!-- Account Settings -->
      <app-card class="mb-6">
        <div class="mb-6">
          <h2 class="text-lg font-bold text-neutral-900 mb-4">Account Settings</h2>
          <div class="space-y-4">
            <app-input label="First Name" placeholder="Moni"></app-input>
            <app-input label="Last Name" placeholder="Roy"></app-input>
            <app-input label="Email" type="email" placeholder="moni&#64;example.com"></app-input>
            <app-input label="Phone" type="tel" placeholder="+32 471 12 34 56"></app-input>
          </div>
        </div>
        <div class="flex gap-3 justify-end border-t border-border pt-6">
          <app-button variant="ghost">Cancel</app-button>
          <app-button variant="primary">Save Changes</app-button>
        </div>
      </app-card>

      <!-- Security -->
      <app-card class="mb-6">
        <div class="mb-6">
          <h2 class="text-lg font-bold text-neutral-900 mb-4">Security</h2>
          <div class="space-y-4">
            <app-input label="Current Password" type="password" placeholder="••••••••"></app-input>
            <app-input label="New Password" type="password" placeholder="••••••••"></app-input>
            <app-input label="Confirm Password" type="password" placeholder="••••••••"></app-input>
          </div>
        </div>
        <div class="flex gap-3 justify-end border-t border-border pt-6">
          <app-button variant="ghost">Cancel</app-button>
          <app-button variant="primary">Update Password</app-button>
        </div>
      </app-card>

      <!-- System Settings -->
      <app-card>
        <div class="mb-6">
          <h2 class="text-lg font-bold text-neutral-900 mb-4">System Settings</h2>
          <div class="space-y-4">
            <div>
              <label class="text-sm font-semibold text-neutral-700">Default Currency</label>
              <select class="w-full mt-2 px-4 py-2.5 border border-border rounded-lg bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary">
                <option>EUR (€)</option>
                <option>USD ($)</option>
                <option>GBP (£)</option>
              </select>
            </div>
            <div>
              <label class="text-sm font-semibold text-neutral-700">Language</label>
              <select class="w-full mt-2 px-4 py-2.5 border border-border rounded-lg bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary">
                <option>English</option>
                <option>French (Français)</option>
                <option>Dutch (Nederlands)</option>
              </select>
            </div>
            <div>
              <label class="text-sm font-semibold text-neutral-700">Time Zone</label>
              <select class="w-full mt-2 px-4 py-2.5 border border-border rounded-lg bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary">
                <option>UTC+01:00 (Europe/Brussels)</option>
                <option>UTC+00:00 (UTC)</option>
              </select>
            </div>
          </div>
        </div>
        <div class="flex gap-3 justify-end border-t border-border pt-6">
          <app-button variant="ghost">Cancel</app-button>
          <app-button variant="primary">Save Settings</app-button>
        </div>
      </app-card>
    </div>
  `,
})
export class SettingsPageComponent {}
