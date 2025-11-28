import type { SankeyData } from '../DashboardDataService';
import React from 'react';
import ReactECharts from 'echarts-for-react';
import styled from 'styled-components';

const ChartContainer = styled.div`
  width: 100%;
  background: var(--background-secondary);
  border: 1px solid var(--background-modifier-border);
  border-radius: 8px;
  padding: 16px;
`;

const ChartTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 16px;
  color: var(--text-normal);
`;

interface SankeyChartProps {
    data: SankeyData;
    currencySymbol: string;
}

export const SankeyChart: React.FC<SankeyChartProps> = ({ data, currencySymbol }) => {
    const isDarkTheme = document.body.classList.contains('theme-dark');

    const formatCurrency = (amount: number): string => {
        return `${currencySymbol}${Math.abs(amount).toLocaleString('zh-CN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        })}`;
    };

    const sankeyOption = {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'item',
            formatter: (params: any) => {
                if (params.dataType === 'edge') {
                    return `${params.data.source} → ${params.data.target}<br/>${formatCurrency(params.data.value)}`;
                }
                return `${params.name}`;
            },
        },
        series: [
            {
                type: 'sankey',
                layout: 'none',
                emphasis: {
                    focus: 'adjacency',
                },
                lineStyle: {
                    color: 'gradient',
                    curveness: 0.5,
                },
                itemStyle: {
                    borderWidth: 0,
                },
                label: {
                    color: isDarkTheme ? '#dcddde' : '#2e3338',
                    fontSize: 12,
                },
                data: data.nodes.map((node) => ({
                    name: node.name === 'Income' ? '总收入' : node.name,
                    itemStyle: {
                        color:
                            node.id === 'Income'
                                ? '#2ecc71'
                                : node.id === 'Balance'
                                    ? '#3498db'
                                    : '#e74c3c',
                    },
                })),
                links: data.links.map((link) => ({
                    source: link.source === 'Income' ? '总收入' : link.source,
                    target: link.target,
                    value: link.value,
                })),
            },
        ],
    };

    return (
        <div>
            <ChartTitle>全景流向</ChartTitle>
            <ChartContainer>
                <ReactECharts
                    option={sankeyOption}
                    style={{ height: '350px' }}
                    opts={{ renderer: 'svg' }}
                />
            </ChartContainer>
        </div>
    );
};
