import type { TransactionRow } from '../financial-report-utils';
import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  background: var(--background-secondary);
  border: 1px solid var(--background-modifier-border);
  border-radius: 8px;
  padding: 16px;
  margin-top: 24px;
`;

const Title = styled.h3`
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
  color: var(--text-muted);  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
`;

const AmountTd = styled(Td)`
  text-align: right;
  font-weight: 500;
  color: var(--text-normal);
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--background-modifier-border);
`;

const PageInfo = styled.span`
  font-size: 13px;
  color: var(--text-muted);
`;

const PageButton = styled.button<{ disabled: boolean }>`
  padding: 6px 12px;
  background: ${(props) =>
        props.disabled ? 'var(--background-modifier-border)' : 'var(--interactive-accent)'};
  color: ${(props) =>
        props.disabled ? 'var(--text-muted)' : 'var(--text-on-accent)'};
  border: none;
  border-radius: 4px;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  font-size: 13px;
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};

  &:hover {
    background: ${(props) =>
        props.disabled
            ? 'var(--background-modifier-border)'
            : 'var(--interactive-accent-hover)'};
  }
`;

interface TransactionTablePaginatedProps {
    transactions: TransactionRow[];
    currencySymbol: string;
}

export const TransactionTablePaginated: React.FC<TransactionTablePaginatedProps> = ({
    transactions,
    currencySymbol,
}) => {
    const [currentPage, setCurrentPage] = React.useState(1);
    const pageSize = 10;

    const totalPages = Math.ceil(transactions.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const displayedTransactions = transactions.slice(startIndex, startIndex + pageSize);

    const canGoPrev = currentPage > 1;
    const canGoNext = currentPage < totalPages;

    const formatCurrency = (value: number) => {
        return `${currencySymbol}${value.toLocaleString('zh-CN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        })}`;
    };

    // 重置页码当交易变化时
    React.useEffect(() => {
        setCurrentPage(1);
    }, [transactions.length]);

    return (
        <Container>
            <Title>交易明细</Title>
            <Table>
                <Thead>
                    <Tr>
                        <Th>日期</Th>
                        <Th>收款人</Th>
                        <Th style={{ textAlign: 'right' }}>金额</Th>
                        <Th>来源账户</Th>
                        <Th>目标账户</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {displayedTransactions.map((tx, index) => (
                        <Tr key={index}>
                            <Td>{tx.date}</Td>
                            <Td title={tx.payee}>{tx.payee}</Td>
                            <AmountTd>{formatCurrency(tx.amount)}</AmountTd>
                            <Td title={tx.sourceAccount}>{tx.sourceAccount}</Td>
                            <Td title={tx.targetAccount}>{tx.targetAccount}</Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>

            {totalPages > 0 && (
                <Pagination>
                    <PageButton
                        disabled={!canGoPrev}
                        onClick={() => setCurrentPage((p) => p - 1)}
                    >
                        ← 前一页
                    </PageButton>
                    <PageInfo>
                        第 {currentPage} 页 / 共 {totalPages} 页
                    </PageInfo>
                    <PageButton
                        disabled={!canGoNext}
                        onClick={() => setCurrentPage((p) => p + 1)}
                    >
                        后一页 →
                    </PageButton>
                </Pagination>
            )}
        </Container>
    );
};
