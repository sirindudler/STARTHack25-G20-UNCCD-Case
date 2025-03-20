import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';

// Register all Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Sample metrics for cards
  metrics = {
    totalUsers: 24859,
    activeUsers: 18432,
    conversion: 5.8,
    revenue: 38642
  };

  constructor() { }

  ngOnInit(): void {
    this.initializeCharts();
  }

  initializeCharts() {
    // Initialize Line Chart for User Growth
    this.createUserGrowthChart();
    
    // Initialize Bar Chart for Revenue by Channel
    this.createRevenueChart();
    
    // Initialize Pie Chart for Traffic Sources
    this.createTrafficSourcesChart();
  }

  createUserGrowthChart() {
    const ctx = document.getElementById('userGrowthChart') as HTMLCanvasElement;
    
    if (!ctx) return;
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Total Users',
          data: [18500, 19200, 21000, 22300, 23500, 24859],
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          tension: 0.3,
          fill: true
        }, {
          label: 'Active Users',
          data: [14200, 14800, 15900, 16800, 17500, 18432],
          borderColor: '#2ecc71',
          backgroundColor: 'rgba(46, 204, 113, 0.1)',
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          }
        },
        scales: {
          y: {
            beginAtZero: false,
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  createRevenueChart() {
    const ctx = document.getElementById('revenueChart') as HTMLCanvasElement;
    
    if (!ctx) return;
    
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Direct', 'Affiliate', 'Email', 'Social', 'Search'],
        datasets: [{
          label: 'Revenue ($)',
          data: [12500, 8300, 5400, 7200, 5200],
          backgroundColor: [
            'rgba(52, 152, 219, 0.7)',
            'rgba(155, 89, 182, 0.7)',
            'rgba(52, 73, 94, 0.7)',
            'rgba(22, 160, 133, 0.7)',
            'rgba(241, 196, 15, 0.7)'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  createTrafficSourcesChart() {
    const ctx = document.getElementById('trafficSourcesChart') as HTMLCanvasElement;
    
    if (!ctx) return;
    
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Organic Search', 'Direct', 'Social Media', 'Referral', 'Email'],
        datasets: [{
          data: [35, 25, 20, 15, 5],
          backgroundColor: [
            'rgba(52, 152, 219, 0.7)',
            'rgba(46, 204, 113, 0.7)',
            'rgba(155, 89, 182, 0.7)',
            'rgba(241, 196, 15, 0.7)',
            'rgba(230, 126, 34, 0.7)'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 15
            }
          }
        }
      }
    });
  }
}