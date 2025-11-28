import type { MonthlyKPI } from '../financial-report-utils';
import React from 'react';
import styled from 'styled-components';

const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: var(--background-secondary);
  border: 1px solid var(--background-modifier-border);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
`;

const CardLabel = styled.div`
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 8px;
`;

const CardValueContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CardIcon = styled.span<{ isPositive: boolean }>`
  font-size: 20px;
  color: ${(props) => (props.isPositive ? '#4ade80' : '#f87171')};
`;

const CardValue = styled.div<{ color: 'green' | 'red' | 'default' }>`
  font-size: 28px;
  font-weight: 700;
  color: ${(props) =>
        props.color === 'green'
            ? '#4ade80'
            : props.color === 'red'
                ? '#f87171'
                : 'var(--text-normal)'};
`;

interface KPICardsProps {
    data: MonthlyKPI;
    currencySymbol: string;
}

export const KPICards: React.FC<KPICardsProps> = ({ data, currencySymbol }) => {
    const formatCurrency = (value: number) => {
        return `${currencySymbol}${Math.abs(value).toLocaleString('zh-CN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        })}`;
    };

    const formatPercent = (value: number) => {
        return `${(value * 100).toFixed(0)}%`;
    };

    return (
        <CardsContainer>
            <Card>
                <CardLabel>本月结余</CardLabel>
                <CardValueContainer>
                    <CardIcon isPositive={data.balance >= 0}>
                        {data.balance >= 0 ? '↑' : '↓'}
                    </CardIcon>
                    <CardValue color={data.balance >= 0 ? 'green' : 'red'}>
                        {formatCurrency(data.balance)}
                    </CardValue>
                </CardValueContainer>
            </Card>

            <Card>
                <CardLabel>本月收入</CardLabel>
                <CardValueContainer>
                    <CardIcon isPositive={true}>↑</CardIcon>
                    <CardValue color="green">{formatCurrency(data.income)}</CardValue>
                </CardValueContainer>
            </Card>

            <Card>
                <CardLabel>本月支出</CardLabel>
                <CardValueContainer>
                    <CardIcon isPositive={false}>↓</CardIcon>
                    <CardValue color="red">{formatCurrency(data.expense)}</CardValue>
                </CardValueContainer>
            </Card>

            <Card>
                <CardLabel>储蓄率</CardLabel>
                <CardValueContainer>
                    <CardIcon isPositive={data.savingsRate >= 0}>%</CardIcon>
                    <CardValue color={data.savingsRate >= 0 ? 'green' : 'red'}>
                        {formatPercent(data.savingsRate)}
                    </CardValue>
                </CardValueContainer>
            </Card>
        </CardsContainer>
    );
};
