import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Message {
  from: string;
  preview: string;
  time: string;
}

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})
export class MessagesComponent {
  messages: Message[] = [
    { from: 'Alex Carey', preview: 'Hey, can we reschedule tomorrow?', time: '2m' },
    { from: 'Kalendra Wingman', preview: 'Loved the new HIIT class!', time: '12m' },
    { from: 'Cameron Williamson', preview: 'Invoice 2451 paid successfully.', time: '1h' }
  ];
}
