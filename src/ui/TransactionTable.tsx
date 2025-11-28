import type { Transaction } from '../financial-report-utils';
import React from 'react';
import styled from 'styled-components';

const TableContainer = styled.div`
  background: var(--background-secondary);
  border: 1px solid var(--background-modifier-border);
  border-radius: 8px;
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
`;

const TableTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 16px;
  color: var(--text-normal);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
`;

const Thead = styled.thead`
  background: var(--background-primary-alt);
  position: sticky;
  top: 0;
  z-index: 1;
`;

const Th = styled.th`
  padding: 8px 12px;
  text-align: left;
  color: var(--text-normal);
  font-weight: 600;
  border-bottom: 1px solid var(--background-modifier-border);
`;

const Tbody = styled.tbody``;

const Tr = styled.tr`
  &:nth-child(even) {
    background: var(--background-primary);
  }

  &:hover {
    background: var(--background-modifier-hover);
  }
`;

const Td = styled.td`
  padding: 8px 12px;
  border-bottom: 1px solid var(--background-modifier-border);
  color: var(--text-muted);
`;

const AmountTd = styled(Td) <{ isIncome?: boolean; isExpense?: boolean }>`
  text-align: right;
  font-weight: 500;
  color: ${(props) =>
        props.isIncome
            ? '#4ade80'
            : props.isExpense
                ? '#f87171'
                : 'var(--text-muted)'};
`;

interface TransactionTableProps {
    data: Transaction[];
    currencySymbol: string;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
    data,
    currencySymbol,
}) => {
    const formatCurrency = (value: number) => {
        if (value === 0) return '-';
        return `${currencySymbol}${value.toLocaleString('zh-CN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        })}`;
    };

    return (
        <div>
            <TableTitle>交易明细</TableTitle>
            <TableContainer>
                <Table>
                    <Thead>
                        <Tr>
                            <Th>日期</Th>
                            <Th>项目</Th>
                            <Th style={{ textAlign: 'right' }}>收入</Th>
                            <Th style={{ textAlign: 'right' }}>支出</Th>
                            <Th style={{ textAlign: 'right' }}>余额</Th>
                            <Th>账户</Th>
                            <Th>备注</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {data.map((tx, index) => (
                            <Tr key={index}>
                                <Td>{tx.date}</Td>
                                <Td>{tx.project}</Td>
                                <AmountTd isIncome={tx.income > 0}>
                                    {formatCurrency(tx.income)}
                                </AmountTd>
                                <AmountTd isExpense={tx.expense > 0}>
                                    {formatCurrency(tx.expense)}
                                </AmountTd>
                                <AmountTd>{formatCurrency(tx.balance)}</AmountTd>
                                <Td>{tx.account}</Td>
                                <Td>{tx.note}</Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>
        </div>
    );
};
