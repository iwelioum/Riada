import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { ClubFrequency, OptionPopularity, RiskScore, SystemHealth } from '../../core/models/api-models';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss'
})
export class StatisticsComponent implements OnInit {
  riskScores: RiskScore[] = [];
  frequencies: ClubFrequency[] = [];
  options: OptionPopularity[] = [];
  health?: SystemHealth;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getRiskScores(10).subscribe((scores) => (this.riskScores = scores || []));
    this.api.getFrequency().subscribe((freq) => (this.frequencies = freq || []));
    this.api.getOptionPopularity().subscribe((opts) => (this.options = opts || []));
    this.api.getSystemHealth().subscribe((health) => (this.health = health));
  }
}
