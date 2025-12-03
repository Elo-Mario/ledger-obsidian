import { DashboardDataService } from '../DashboardDataService';
import type { TransactionCache } from '../parser';
import type { ISettings } from '../settings';
import { KPICards } from './KPICards';
import { MonthSelector } from './MonthSelector';
import { SankeyChart } from './SankeyChart';
import { DualTreemap } from './DualTreemap';
import { TransactionTablePaginated } from './TransactionTablePaginated';
import { TrendChart } from './TrendChart';
import React from 'react';
import styled from 'styled-components';
import { LedgerModifier } from '../file-interface';
import { getTransactionsWithAccounts } from '../financial-report-utils';

const Container = styled.div`
  padding: 20px;
  background: var(--background-primary);
`;

const ChartsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

interface FinancialReportProps {
  txCache: TransactionCache;
  settings: ISettings;
  updater: LedgerModifier;
  onBack?: () => void;
}

export const FinancialReport: React.FC<FinancialReportProps> = ({
  txCache,
  settings,
  updater,
  onBack,
}) => {
  const [selectedMonth, setSelectedMonth] = React.useState(window.moment());

  // 创建数据服务
  const dataService = React.useMemo(
    () => new DashboardDataService(txCache, settings),
    [txCache, settings],
  );

  // 检查某月是否有数据
  const hasDataForMonth = React.useCallback(
    (month: ReturnType<typeof window.moment>) => {
      const start = month.clone().startOf('month');
      const end = month.clone().endOf('month');
      return txCache.transactions.some((tx) => {
        const txDate = window.moment(tx.value.date, ['YYYY-MM-DD', 'YYYY/MM/DD']);
        return txDate.isBetween(start, end, null, '[]');
      });
    },
    [txCache],
  );

  const canGoPrev = React.useMemo(
    () => hasDataForMonth(selectedMonth.clone().subtract(1, 'month')),
    [selectedMonth, hasDataForMonth],
  );

  const canGoNext = React.useMemo(
    () =>
      selectedMonth.isBefore(window.moment(), 'month') &&
      hasDataForMonth(selectedMonth.clone().add(1, 'month')),
    [selectedMonth, hasDataForMonth],
  );

  // 使用数据服务计算各项数据
  const kpiData = React.useMemo(
    () => dataService.calculateKPIs(selectedMonth),
    [dataService, selectedMonth],
  );

  const sankeyData = React.useMemo(
    () => dataService.generateSankeyData(selectedMonth),
    [dataService, selectedMonth],
  );

  const trendData = React.useMemo(
    () => dataService.generateTrendData(selectedMonth),
    [dataService, selectedMonth],
  );

  const dualTreemapData = React.useMemo(
    () => dataService.generateDualTreemapData(selectedMonth),
    [dataService, selectedMonth],
  );

  // 交易明细
  const transactions = React.useMemo(
    () => getTransactionsWithAccounts(txCache, selectedMonth),
    [txCache, selectedMonth],
  );

  return (
    <Container>
      <MonthSelector
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
        onBack={onBack}
      />

      <KPICards data={kpiData} currencySymbol={settings.currencySymbol} />

      <ChartsRow>
        <SankeyChart data={sankeyData} currencySymbol={settings.currencySymbol} />
        <TrendChart data={trendData} currencySymbol={settings.currencySymbol} />
      </ChartsRow>

      <DualTreemap
        assetsData={dualTreemapData.assets}
        liabilitiesData={dualTreemapData.liabilities}
        currencySymbol={settings.currencySymbol}
      />

      <TransactionTablePaginated
        transactions={transactions}
        currencySymbol={settings.currencySymbol}
      />
    </Container>
  );
};
