import { EnhancedTransaction } from '../parser';

import { getTotal } from '../transaction-utils';
import React, { useState } from 'react';
import styled from 'styled-components';

interface ReconcileTransactionsProps {
    transactions: EnhancedTransaction[];
    currencySymbol: string;
    onReconcile: (selectedTxs: EnhancedTransaction[]) => Promise<void>;
    onClose: () => void;
}

const Container = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 20px;
`;

const Title = styled.h2`
  margin: 0 0 10px 0;
  color: var(--text-normal);
`;

const SelectAllContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
  padding: 10px;
  background: var(--background-secondary);
  border-radius: 4px;
`;

const TransactionList = styled.div`
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid var(--background-modifier-border);
  border-radius: 4px;
  margin-bottom: 20px;
`;

const TransactionItem = styled.div<{ selected: boolean }>`
  padding: 12px;
  border-bottom: 1px solid var(--background-modifier-border);
  cursor: pointer;
  background: ${(props) =>
        props.selected ? 'var(--background-modifier-hover)' : 'transparent'};
  transition: background 0.2s;

  &:hover {
    background: var(--background-modifier-hover);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TransactionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
`;

const Checkbox = styled.input`
  cursor: pointer;
  width: 16px;
  height: 16px;
`;

const TransactionDate = styled.span`
  color: var(--text-muted);
  font-size: 0.9em;
  min-width: 80px;
`;

const TransactionPayee = styled.span`
  font-weight: 500;
  color: var(--text-normal);
  flex: 1;
`;

const TransactionAmount = styled.span`
  font-weight: 600;
  color: var(--text-accent);
`;

const TransactionDetails = styled.div`
  margin-left: 26px;
  font-size: 0.85em;
  color: var(--text-muted);
`;

const AccountLine = styled.div`
  margin: 2px 0;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid var(--background-modifier-border);
`;

const SelectedCount = styled.div`
  color: var(--text-muted);
  font-size: 0.9em;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button<{ primary?: boolean }>`
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;

  ${(props) =>
        props.primary
            ? `
    background: var(--interactive-accent);
    color: var(--text-on-accent);
    
    &:hover {
      background: var(--interactive-accent-hover);
    }
  `
            : `
    background: var(--background-modifier-border);
    color: var(--text-normal);
    
    &:hover {
      background: var(--background-modifier-border-hover);
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: var(--text-muted);
`;

export const ReconcileTransactions: React.FC<ReconcileTransactionsProps> = ({
    transactions,
    currencySymbol,
    onReconcile,
    onClose,
}) => {
    const [selectedTxIds, setSelectedTxIds] = useState<Set<string>>(new Set());
    const [isProcessing, setIsProcessing] = useState(false);

    // Generate unique ID for transaction
    const getTxId = (tx: EnhancedTransaction): string => {
        return `${tx.value.date}-${tx.value.payee}-${tx.block.firstLine}`;
    };

    // Handle select all / deselect all
    const handleSelectAll = () => {
        if (selectedTxIds.size === transactions.length) {
            setSelectedTxIds(new Set());
        } else {
            setSelectedTxIds(new Set(transactions.map((tx) => getTxId(tx))));
        }
    };

    // Handle individual transaction toggle
    const handleToggle = (tx: EnhancedTransaction) => {
        const id = getTxId(tx);
        const newSet = new Set(selectedTxIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedTxIds(newSet);
    };

    // Handle reconcile button click
    const handleReconcileClick = async () => {
        const selectedTransactions = transactions.filter((tx) =>
            selectedTxIds.has(getTxId(tx)),
        );

        if (selectedTransactions.length === 0) return;

        setIsProcessing(true);
        try {
            await onReconcile(selectedTransactions);
        } catch (error) {
            console.error('Reconciliation failed:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    // Get account summary for a transaction
    const getAccountSummary = (tx: EnhancedTransaction): string[] => {
        const accounts: string[] = [];
        tx.value.expenselines.forEach((line) => {
            if ('account' in line) {
                accounts.push(line.account);
            }
        });
        return accounts;
    };

    const allSelected = selectedTxIds.size === transactions.length && transactions.length > 0;

    return (
        <Container>
            <Header>
                <Title>对账</Title>
            </Header>

            {transactions.length === 0 ? (
                <EmptyState>暂无未对账的交易</EmptyState>
            ) : (
                <>
                    <SelectAllContainer>
                        <Checkbox
                            type="checkbox"
                            checked={allSelected}
                            onChange={handleSelectAll}
                        />
                        <span>
                            {allSelected ? '取消全选' : '全选'}
                        </span>
                    </SelectAllContainer>

                    <TransactionList>
                        {transactions.map((tx) => {
                            const txId = getTxId(tx);
                            const isSelected = selectedTxIds.has(txId);
                            const accounts = getAccountSummary(tx);
                            const total = getTotal(tx, currencySymbol);

                            return (
                                <TransactionItem
                                    key={txId}
                                    selected={isSelected}
                                    onClick={() => handleToggle(tx)}
                                >
                                    <TransactionHeader>
                                        <Checkbox
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => handleToggle(tx)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <TransactionDate>{tx.value.date}</TransactionDate>
                                        <TransactionPayee>{tx.value.payee}</TransactionPayee>
                                        <TransactionAmount>{total}</TransactionAmount>
                                    </TransactionHeader>
                                    <TransactionDetails>
                                        {accounts.map((account, idx) => (
                                            <AccountLine key={idx}>
                                                {idx === 0 ? '→' : '←'} {account}
                                            </AccountLine>
                                        ))}
                                    </TransactionDetails>
                                </TransactionItem>
                            );
                        })}
                    </TransactionList>

                    <Footer>
                        <SelectedCount>
                            已选择: {selectedTxIds.size} 笔交易
                        </SelectedCount>
                        <ButtonGroup>
                            <Button onClick={onClose} disabled={isProcessing}>
                                取消
                            </Button>
                            <Button
                                primary
                                onClick={handleReconcileClick}
                                disabled={selectedTxIds.size === 0 || isProcessing}
                            >
                                {isProcessing
                                    ? '处理中...'
                                    : `完成对账 (${selectedTxIds.size})`}
                            </Button>
                        </ButtonGroup>
                    </Footer>
                </>
            )}
        </Container>
    );
};
