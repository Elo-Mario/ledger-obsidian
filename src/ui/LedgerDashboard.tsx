import {
  makeDailyAccountBalanceChangeMap,
  makeDailyBalanceMap,
} from '../balance-utils';
import { Interval } from '../date-utils';
import { LedgerModifier } from '../file-interface';
import type { TransactionCache } from '../parser';
import { ISettings } from '../settings';
import { ReconcileModal } from '../reconcile-modal';

import { AccountsList } from './AccountsList';
import { AccountVisualization } from './AccountVisualization';
import { DateRangeSelector } from './DateRangeSelector';
import { FinancialReport } from './FinancialReport';
import { NetWorthVisualization } from './NetWorthVisualization';
import { ParseErrors } from './ParseErrors';
import {
  FlexContainer,
  FlexFloatRight,
  FlexMainContent,
  FlexShrink,
} from './SharedStyles';
import { RecentTransactionList, TransactionList } from './TransactionList';
import { Platform } from 'obsidian';
import React from 'react';
import styled from 'styled-components';

const FlexSidebar = styled(FlexShrink)`
  flex-basis: 20%;
`;

export const LedgerDashboard: React.FC<{
  settings: ISettings;
  txCache: TransactionCache;
  updater: LedgerModifier;
}> = (props): JSX.Element => {
  if (!props.txCache) {
    return <p>Loading...</p>;
  }

  return Platform.isMobile ? (
    <MobileDashboard settings={props.settings} txCache={props.txCache} />
  ) : (
    <DesktopDashboard
      settings={props.settings}
      txCache={props.txCache}
      updater={props.updater}
    />
  );
};

const Header: React.FC<{ settings: ISettings }> = (props): JSX.Element => (
  <div>
    <FlexContainer>
      <FlexSidebar>
        <h2>{props.settings.dashboardTitle}</h2>
      </FlexSidebar>
      <FlexFloatRight>{props.children}</FlexFloatRight>
    </FlexContainer>
  </div>
);

const MobileDashboard: React.FC<{
  settings: ISettings;
  txCache: TransactionCache;
}> = (props): JSX.Element => {
  const [selectedTab, setSelectedTab] = React.useState('transactions');

  return <p>Dashboard not yet supported on mobile.</p>;
};

const DesktopDashboard: React.FC<{
  settings: ISettings;
  txCache: TransactionCache;
  updater: LedgerModifier;
}> = (props): JSX.Element => {
  const dailyAccountBalanceMap = React.useMemo(() => {
    const changeMap = makeDailyAccountBalanceChangeMap(
      props.txCache.transactions,
    );
    const balanceMap = makeDailyBalanceMap(
      props.txCache.accounts,
      changeMap,
      props.txCache.firstDate,
      window.moment(),
    );

    return balanceMap;
  }, [props.txCache]);

  const [selectedAccounts, setSelectedAccounts] = React.useState<string[]>([]);
  const [startDate, setStartDate] = React.useState(
    window.moment().subtract(2, 'months'),
  );
  const [endDate, setEndDate] = React.useState(window.moment());
  const [interval, setInterval] = React.useState<Interval>('week');
  const [showReport, setShowReport] = React.useState(false);

  if (showReport) {
    return (
      <FinancialReport
        txCache={props.txCache}
        settings={props.settings}
        updater={props.updater}
      />
    );
  }

  return (
    <>
      <Header settings={props.settings}>
        <DateRangeSelector
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          interval={interval}
          setInterval={setInterval}
        />
      </Header>

      <FlexContainer>
        <FlexSidebar>
          <AccountsList
            txCache={props.txCache}
            settings={props.settings}
            selectedAccounts={selectedAccounts}
            setSelectedAccounts={setSelectedAccounts}
          >
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => {
                  new ReconcileModal((props.updater as any).plugin).open();
                }}
                style={{
                  padding: '8px 12px',
                  background: 'var(--interactive-accent)',
                  color: 'var(--text-on-accent)',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  width: '100%',
                }}
              >
                对账
              </button>
              <button
                onClick={() => setShowReport(true)}
                style={{
                  padding: '8px 12px',
                  background: 'var(--interactive-accent)',
                  color: 'var(--text-on-accent)',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  width: '100%',
                }}
              >
                财务报表
              </button>
            </div>
          </AccountsList>
        </FlexSidebar>
        <FlexMainContent>
          {props.txCache.parsingErrors.length > 0 ? (
            <ParseErrors txCache={props.txCache} />
          ) : null}
          {selectedAccounts.length === 0 ? (
            <>
              <NetWorthVisualization
                dailyAccountBalanceMap={dailyAccountBalanceMap}
                startDate={startDate}
                endDate={endDate}
                interval={interval}
                settings={props.settings}
              />
              <RecentTransactionList
                currencySymbol={props.settings.currencySymbol}
                txCache={props.txCache}
                updater={props.updater}
                startDate={startDate}
                endDate={endDate}
              />
            </>
          ) : (
            <>
              <AccountVisualization
                dailyAccountBalanceMap={dailyAccountBalanceMap}
                allAccounts={props.txCache.accounts}
                selectedAccounts={selectedAccounts}
                startDate={startDate}
                endDate={endDate}
                interval={interval}
                settings={props.settings}
              />
              <TransactionList
                currencySymbol={props.settings.currencySymbol}
                txCache={props.txCache}
                updater={props.updater}
                selectedAccounts={selectedAccounts}
                setSelectedAccount={(account: string) =>
                  setSelectedAccounts([account])
                }
                startDate={startDate}
                endDate={endDate}
              />
            </>
          )}
        </FlexMainContent>
      </FlexContainer>
    </>
  );
};
