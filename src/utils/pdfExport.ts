import { jsPDF } from 'jspdf';
import type { TestResult } from '../models/TestResult';
import { formatTime } from './time';

const SERIES_LABELS: Record<string, string> = {
  A: 'A 系列',
  Ab: 'Ab 系列',
  B: 'B 系列',
  C: 'C 系列',
  D: 'D 系列',
  E: 'E 系列',
};

function addDivider(doc: jsPDF, y: number): number {
  doc.setDrawColor(218, 220, 224);
  doc.setLineWidth(0.2);
  doc.line(14, y, 196, y);
  return y + 6;
}

function addSectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFontSize(14);
  doc.setTextColor(26, 115, 232);
  doc.text(title, 14, y);
  doc.setTextColor(32, 33, 36);
  return y + 8;
}

export function exportResultToPDF(result: TestResult, filename?: string): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  let y = 20;

  doc.setFontSize(20);
  doc.setTextColor(26, 115, 232);
  doc.text('瑞文标准推理测验结果报告', 105, y, { align: 'center' });
  y += 10;

  doc.setFontSize(10);
  doc.setTextColor(95, 99, 104);
  doc.text(`导出时间：${new Date().toLocaleString('zh-CN')}`, 105, y, { align: 'center' });
  y += 14;

  y = addSectionTitle(doc, '基本信息', y);
  doc.setFontSize(11);
  doc.text(`测试日期：${new Date(result.date).toLocaleString('zh-CN')}`, 14, y);
  y += 7;
  doc.text(`年龄：${result.age} 岁`, 14, y);
  y += 7;
  doc.text(`总用时：${formatTime(result.totalTimeSeconds)}`, 14, y);
  y += 10;
  y = addDivider(doc, y);

  y = addSectionTitle(doc, '测验成绩', y);
  doc.setFontSize(28);
  doc.setTextColor(26, 115, 232);
  doc.text(String(result.iqScore), 105, y, { align: 'center' });
  y += 8;
  doc.setFontSize(12);
  doc.setTextColor(95, 99, 104);
  doc.text('智商分数 (IQ)', 105, y, { align: 'center' });
  y += 10;

  doc.setFontSize(12);
  doc.setTextColor(32, 33, 36);
  doc.text(`智力等级：${result.iqLevel}`, 14, y);
  y += 7;
  doc.text(`原始分：${result.rawScore} / 72`, 14, y);
  y += 7;
  doc.text(`百分等级：${result.percentile}%`, 14, y);
  y += 10;
  y = addDivider(doc, y);

  y = addSectionTitle(doc, '各系列得分', y);
  const entries = Object.entries(result.seriesScores);
  const colW = 60;
  const startX = 14;
  let x = startX;

  for (let i = 0; i < entries.length; i++) {
    const [series, score] = entries[i];
    const label = SERIES_LABELS[series] ?? series;

    doc.setFillColor(248, 249, 250);
    doc.roundedRect(x, y - 5, colW - 6, 16, 2, 2, 'F');

    doc.setFontSize(10);
    doc.setTextColor(95, 99, 104);
    doc.text(label, x + 4, y);

    doc.setFontSize(14);
    doc.setTextColor(26, 115, 232);
    doc.text(`${score} / 12`, x + colW - 10, y, { align: 'right' });
    doc.setTextColor(32, 33, 36);

    x += colW;
    if ((i + 1) % 3 === 0) {
      x = startX;
      y += 22;
    }
  }

  if (entries.length % 3 !== 0) y += 22;
  y = addDivider(doc, y);

  y = addSectionTitle(doc, '答题详情', y);
  doc.setFontSize(9);
  doc.setTextColor(95, 99, 104);
  doc.text('题号', 14, y);
  doc.text('选择', 50, y);
  doc.text('正确', 80, y);
  doc.text('用时', 110, y);
  y += 5;

  for (const ans of result.answers) {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(9);
    doc.setTextColor(32, 33, 36);
    doc.text(ans.questionId, 14, y);
    doc.text(String(ans.selectedAnswer + 1), 50, y);

    if (ans.isCorrect) {
      doc.setTextColor(52, 168, 83);
      doc.text('✓ 正确', 80, y);
    } else {
      doc.setTextColor(234, 67, 53);
      doc.text('✗ 错误', 80, y);
    }

    doc.setTextColor(32, 33, 36);
    doc.text(formatTime(ans.timeSeconds), 110, y);
    y += 6;
  }

  const finalY = Math.min(y + 6, 286);
  doc.setFontSize(9);
  doc.setTextColor(95, 99, 104);
  doc.text('本报告由瑞文标准推理测验系统自动生成', 105, finalY, { align: 'center' });

  const name = filename ?? `raven-iq-${result.id}.pdf`;
  doc.save(name);
}
