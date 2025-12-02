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
                // Show node name with tooltip for nodes
                return `${params.name}`;
            },
        },
        series: [
            {
                type: 'sankey',
                layout: 'none',
                // Force alignment to justify - ensures perfect rectangular layout
                nodeAlign: 'justify',
                // Increase layout iterations for better optimization
                layoutIterations: 64,
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
                data: data.nodes.map((node) => {
                    // Color mapping based on node type
                    let color: string;

                    if (node.id === '结余') {
                        // Savings/Surplus (right-side balance) - Deep teal/cyan
                        color = '#059669'; // Represents asset accumulation
                    } else if (node.id === '存量消耗') {
                        // Supplement/Deficit (left-side balance) - Warning amber
                        color = '#F59E0B'; // Represents drawing from reserves
                    } else if (node.name.includes('收入') || node.name.includes('Income')) {
                        // Income categories - Emerald green
                        color = '#10B981';
                    } else if (node.name.includes('支出') || node.name.includes('Expense')) {
                        // Expense categories - Rose red/coral
                        color = '#F43F5E';
                    } else {
                        // Default for uncategorized nodes - Gray
                        color = '#6B7280';
                    }

                    return {
                        name: node.name,
                        itemStyle: { color },
                    };
                }),
                links: data.links.map((link) => ({
                    source: link.source,
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
