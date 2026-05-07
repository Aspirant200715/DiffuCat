import { PredictionResult } from './types';

export function exportToCSV(predictions: PredictionResult[]) {
  if (predictions.length === 0) return;

  const headers = ['SMILES', 'Activity', 'Selectivity', 'Stability', 'UCB Score', 'Pareto Optimal'];
  const rows = predictions.map(p => [
    p.smiles,
    p.metrics.activity.toFixed(4),
    p.metrics.selectivity.toFixed(4),
    p.metrics.stability.toFixed(4),
    p.ucb_score.toFixed(4),
    p.pareto_optimal ? 'Yes' : 'No'
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(e => e.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `diffucat_discovery_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON(predictions: PredictionResult[]) {
  if (predictions.length === 0) return;

  const dataStr = JSON.stringify(predictions, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const link = document.createElement('a');
  link.setAttribute('href', dataUri);
  link.setAttribute('download', `diffucat_report_${new Date().toISOString().split('T')[0]}.json`);
  link.click();
}
